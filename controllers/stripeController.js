const { computeHTandVAT, eurosToCents } = require("../helpers/priceHelpers");
const { Order, InvoiceCounter, ShopInvoiceCounter } = require("../models");
const { validationModule } = require("../modules");
const { isUser } = require("../modules/verification");

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
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      handlePaymentIntentSuceeded(paymentIntent);
      break;
    case "payment_intent.payment_failed":
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }

  res.send();
};

const handlePaymentIntentSuceeded = async (paymentIntent) => {
  if (paymentIntent.status === "succeeded") {
    const paymentIntentId = paymentIntent.id;
    const order = await Order.findOne({ stripePIId: paymentIntentId });

    order.isPaid = true;
    await order.save();
    console.log("commande isPaid true");
  }
};

/*  créer un client Stripe quand il n'existe pas */
const createStripeCustomer = async (user) => {
  const customer = await stripe.customers.create({
    name: `${user.firstname} ${user.lastname}`,
    email: user.email,
  });

  user.stripeUUID = customer.id;
  await user.save();

  return customer;
};

/* récupère le customer stripe */
const getStripeCustomer = async (user) => {
  let customer;
  if (user.stripeUUID) {
    try {
      customer = await stripe.customers.retrieve(user.stripeUUID);
    } catch (err) {
      if (err.code === "resource_missing") {
        customer = await createStripeCustomer(user);
      } else {
        throw err;
      }
    }
  }
  if (!customer) {
    customer = await createStripeCustomer(user);
  }
  return customer;
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

    const { amount, billingAddress, shippingAddress, cart } = req.body;

    const customer = await getStripeCustomer(user);

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const order = await createNewOrder(
      user,
      cart,
      paymentIntent.id,
      billingAddress,
      shippingAddress,
    );

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const canCreatePaymentIntent = async (userId, data) => {
  const user = await isUser(userId);

  if (!user) return { success: false, message: "User not found." };

  if (!validationModule.isAddressComplete(data.billingAddress)) {
    return {
      success: false,
      message: "L'adresse de facturation est incomplète.",
    };
  }

  if (
    data.shippingAddress &&
    !validationModule.isAddressComplete(data.shippingAddress)
  ) {
    return {
      success: false,
      message: "L'adresse de livraison est incomplète.",
    };
  }

  return { success: true, user };
};

// cette fonction n'est plus utilisée
const createPaymentIntent = async (req, res) => {
  try {
    console.log("body :", req.body);
    const { amount, billingAddress, shippingAddress, cart } = req.body;

    console.log("billingAddress :", billingAddress);
    console.log("shippingAddress :", shippingAddress);

    if (!validationModule.isAddressComplete(billingAddress)) {
      throw new Error("L'adresse de facturation est incomplète.");
    }

    if (
      shippingAddress &&
      !validationModule.isAddressComplete(shippingAddress)
    ) {
      throw new Error("L'adresse de livraison est incomplète.");
    }

    const user = await isUser(req.auth.userId);

    let customer;
    if (user.stripeUUID) {
      try {
        customer = await stripe.customers.retrieve(user.stripeUUID);
      } catch (err) {
        if (err.code === "resource_missing") {
          customer = await createStripeCustomer(user);
        } else {
          throw err;
        }
      }
    }

    if (!customer) {
      customer = await createStripeCustomer(user);
      // customer = await stripe.customers.create({
      //   name: `${req.body.customer.firstname} ${req.body.customer.lastname}`,
      //   email: user.email,
      // });

      // user.stripeUUID = customer.id;
      // await user.save();
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" },
    );

    console.log("api version :", stripe.getApiField("version"));
    console.log("ephemeralkey version :", ephemeralKey);

    const paymentIntent = await stripe.paymentIntents.create({
      // amount: Math.floor(amount * 100),
      amount: eurosToCents(amount),
      currency: "eur",
      customer: customer.id,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter
      // is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const order = await createNewOrder(
      user,
      cart,
      paymentIntent.id,
      billingAddress,
      shippingAddress,
    );

    // console.log("order créé :", JSON.stringify(order, null, 2))

    console.log("JSON renvoyé : ", {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      order,
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const createNewOrder = async (
  user,
  cart,
  paymentIntentId,
  billingAddress,
  shippingAddress,
) => {
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
        shopInvoiceNumber: await generateShopInvoiceNumber(shopCart.shop._id),
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
      stripePIId: paymentIntentId,
      totalHT,
      totalVAT,
      totalTTC,
      invoiceNumber: await generateInvoiceNumber(),
    });

    await newOrder.save();
    return newOrder;
  } catch (error) {
    console.error(error);
  }
};

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const counter = await InvoiceCounter.findOneAndUpdate(
    { year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  );

  const paddedSequence = counter.sequence.toString().padStart(6, "0");

  return `${year}-${paddedSequence}`;
};

const generateShopInvoiceNumber = async (shopId) => {
  const year = new Date().getFullYear();

  const counter = await ShopInvoiceCounter.findOneAndUpdate(
    { shop: shopId, year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  );

  const prefix = shopId.slice(-5);

  const paddedSequence = counter.sequence.toString().padStart(6, "0");

  return `${prefix}-${year}-${paddedSequence}`;
};

const calculateOrderPrice = (details) => {
  let totalPrice = 0;

  details.forEach((detail) => {
    let shopTotalPrice = 0;

    detail.products.forEach((product) => {
      const price = parseFloat(product.price);
      const quantity =
        product.unit === "gr" ? product.quantity / 1000 : product.quantity;
      shopTotalPrice += price * quantity;
    });

    detail.shopTotalPrice = shopTotalPrice.toFixed(2);
    totalPrice += shopTotalPrice;
  });

  return totalPrice.toFixed(2);
};

module.exports = {
  createCustomerSession,
  createPaymentIntent,
  webhookReceiver,
  createNewOrder,
  paymentSheet,
};
