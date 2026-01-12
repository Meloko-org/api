const { computeHTandVAT } = require("../helpers/priceHelpers");
const {
  Order,
  CreditNote,
  InvoiceCounter,
  ShopInvoiceCounter,
} = require("../models");
const { validationModule } = require("../modules");
const { isUser } = require("../modules/verification");
const { generateOrderNumber } = require("../services/orderService");
const { reserveStockForOrder } = require("../services/stockService");
const { updateRefundedProduct } = require("../services/orderService");
const {
  getStripeCustomer,
  canCreatePaymentIntent,
} = require("../helpers/stripeHelpers");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const webhookReceiver = async (req, res) => {
  let event = req.body;
  if (endpointSecret) {
    const signature = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret,
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  }

  // handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      await handlePaymentIntentSucceeded(paymentIntent);
      break;
    case "payment_intent.payment_failed":
      break;
    case "refund.created":
      await handleRefundCreated(event.data.object);
      break;
    case "refund.failed":
      await handleRefundFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }

  res.sendStatus(200);
};

const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    if (paymentIntent.status !== "succeeded") return;

    const orderId = paymentIntent.metadata?.orderId;

    if (!orderId) {
      console.error("No orderId in paymentIntent metadata");
      return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
      console.error(
        "⚠️ Webhook received but no order found for orderId:",
        orderId,
      );
      return;
    }

    // idempotence : si déjà payé, on ne refait rien
    if (order.isPaid) {
      console.log("ℹ️ Order already marked as paid:", order._id.toString());
      return;
    }

    order.isPaid = true;
    order.paidAt = new Date(); // recommandé
    // order.paymentIntentId = paymentIntent.id;
    await order.save();

    try {
      await reserveStockForOrder(order._id);
    } catch (error) {
      let payload;

      try {
        payload = JSON.parse(error.message);
      } catch {
        throw error; // vraie erreur technique
      }

      if (payload.code === "INSUFFICIENT_STOCK") {
        payload.stockIssues.forEach((issue) => {
          const impactedSubOrder = order.details.find(
            (d) => d._id.toString() === issue.subOrderId,
          );

          if (impactedSubOrder) {
            impactedSubOrder.stockIssue = true;
            impactedSubOrder.stockIssueProduct = issue.productId;
          }
        });

        await order.save();

        return;
      }

      if (payload.code === "INSUFFICIENT_STOCK") {
        const impactedSubOrder = order.details.find(
          (d) => d._id.toString() === payload.subOrderId,
        );

        if (impactedSubOrder) {
          impactedSubOrder.stockIssue = true;
          impactedSubOrder.stockIssueProduct = payload.productId;
        }

        // order.hasStockIssue = true;
        await order.save();

        return;
      }

      throw error;
    }

    console.log("✅ Order marked as paid:", order._id.toString());
  } catch (error) {
    console.error("❌ Error in payment_intent.succeeded webhook:", error);
  }
};

const handleRefundCreated = async (refund) => {
  console.log("WEBHOOK : handleRefundCreated →", refund.id);

  try {
    const { creditNoteId, reason } = refund.metadata || {};

    if (!creditNoteId) {
      console.warn("Refund sans creditNoteId, ignoré");
      return;
    }

    const creditNote = await CreditNote.findOneAndUpdate(
      {
        _id: creditNoteId,
        stripeRefundId: refund.id,
        status: { $ne: "refunded" },
      },
      {
        $set: {
          status: "refunded",
          refundedAt: new Date(),
        },
      },
      { new: true },
    );

    if (!creditNote) {
      console.warn(
        "Refund received but creditNote not found or already refunded",
        creditNoteId,
      );
      return;
    }

    // modification productDetail
    await updateRefundedProduct(creditNote);
  } catch (error) {
    console.error("❌ Error in handleRefundCreated:", error);
  }
};

const handleRefundFailed = async (refund) => {
  const { creditNoteId } = refund.metadata || {};

  if (!creditNoteId) return;

  await CreditNote.updateOne(
    { _id: creditNoteId },
    {
      $set: {
        status: "failed",
        failureReason: refund.failure_reason || "unknown",
      },
    },
  );
};

const createCustomerSession = async (req, res) => {
  try {
    const user = await isUser(req.auth.userId);
    if (!user) throw new Error("USer not found.");

    const customer = await getStripeCustomer(user);

    const customerSession = await stripe.customerSessions.create({
      customer: customer.id,
      components: {
        mobile_payment_element: {
          enabled: true,
          features: {
            payment_method_save: "enabled",
            payment_method_redisplay: "enabled",
            payment_method_remove: "enabled",
          },
        },
      },
    });

    res.json({ customerSessionClientSecret: customerSession.client_secret });
  } catch (error) {
    console.error("customerSession error:", error);
    res.status(500).json({ error: error.message });
  }
};

const paymentSheet = async (req, res) => {
  try {
    /* vérification des données avant de procéder au payment_intent */
    const { success, user, message } = await canCreatePaymentIntent(
      req.auth.userId,
      req.body,
    );

    if (!success) {
      throw new Error(message);
    }

    const { billingAddress, shippingAddress, cart } = req.body;

    const customer = await getStripeCustomer(user);

    /* création de l'order */
    const order = await createNewOrder(
      user,
      cart,
      billingAddress,
      shippingAddress,
    );

    if (!order) {
      throw new Error("Order creation failed !");
    }

    console.log("id order created :", order._id);

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalTTC,
      currency: "eur",
      metadata: {
        orderId: order._id.toString(),
      },
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // order.stripePIId = paymentIntent.id;
    order.paymentIntentId = paymentIntent.id;
    await order.save();

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      orderId: order._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const createNewOrder = async (user, cart, billingAddress, shippingAddress) => {
  try {
    if (!validationModule.isAddressComplete(billingAddress)) {
      throw new Error("L'adresse de facturation est incomplète.");
    }

    if (
      shippingAddress &&
      !validationModule.isAddressComplete(shippingAddress)
    ) {
      throw new Error("L'adresse de livraison est incomplète.");
    }

    const details = [];
    let totalHT = 0;
    let totalVAT = 0;
    let totalTTC = 0;

    for (const shopCart of cart) {
      let shopTotalHT = 0;
      let shopTotalVAT = 0;
      let shopTotalTTC = 0;

      const products = shopCart.products.map((p) => {
        const productPriceTTC_cents = Number(p.stockData.price);
        if (!Number.isFinite(productPriceTTC_cents)) {
          throw new Error("Prix produit invalide");
        }

        const rawQuantity = Number(p.quantity);
        if (!Number.isFinite(rawQuantity)) {
          throw new Error("Quantité invalide");
        }

        const unit = p.stockData.product.weight.unit;
        const unitDiv = unit === "gr" ? 1000 : 1;

        const vatRate = Number(p.stockData.product.vatRate ?? 5.5);

        // calcul des prix unitaires HT et VAT en centimes du produit
        const { unitPriceHT_cents, unitVAT_cents } = computeHTandVAT(
          productPriceTTC_cents,
          vatRate,
        );

        // calcul des montants pour la quantité
        const amountProductTTC = Math.round(
          (productPriceTTC_cents * rawQuantity) / unitDiv,
        );
        const amountProductHT = Math.round(
          (unitPriceHT_cents * rawQuantity) / unitDiv,
        );
        const amountProductVAT = amountProductTTC - amountProductHT;

        shopTotalHT += amountProductHT;
        shopTotalVAT += amountProductVAT;
        shopTotalTTC += amountProductTTC;

        return {
          product: p.stockData._id,
          quantity: rawQuantity,
          unit,
          unitPriceHT: unitPriceHT_cents,
          unitPriceTTC: productPriceTTC_cents,
          vatRate,
          vatAmount: unitVAT_cents,
          totalPriceTTC: amountProductTTC,
          productStatus: "pending",
        };
      });

      // arrondi des totaux pour le shop
      shopTotalHT = Math.round(shopTotalHT);
      shopTotalVAT = Math.round(shopTotalVAT);
      shopTotalTTC = Math.round(shopTotalTTC);

      totalHT += shopTotalHT;
      totalVAT += shopTotalVAT;
      totalTTC += shopTotalTTC;

      details.push({
        products,
        withdrawMode: shopCart.withdrawMode,
        withdrawMarket: shopCart.withdrawMarket,
        withdrawDay: shopCart.withdrawDay,
        shop: shopCart.shop._id,
        shopTotalHT,
        shopTotalVAT,
        shopTotalTTC,
        status: "pending",
      });
    }

    // arrondis des totaux
    totalHT = Math.round(totalHT);
    totalVAT = Math.round(totalVAT);
    totalTTC = Math.round(totalTTC);

    // correction au cas ou TTC !== HT + VAT
    if (totalTTC !== totalHT + totalVAT) {
      const delta = totalTTC - (totalHT + totalVAT);
      totalVAT += delta;
    }

    const newOrder = new Order({
      user: user._id,
      billingAddress: {
        ...billingAddress.address,
        name: billingAddress.name,
      },
      shippingAddress: shippingAddress
        ? {
            ...shippingAddress,
            name: shippingAddress.name,
          }
        : null,
      details,
      isWithdrawn: false,
      isPaid: false,
      paymentMethod: "stripe",
      totalHT,
      totalVAT,
      totalTTC,
      orderNumber: await generateOrderNumber(),
    });

    await newOrder.save();
    return newOrder;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createCustomerSession,
  webhookReceiver,
  handleRefundCreated,
  createNewOrder,
  paymentSheet,
};
