const { User, Order } = require("../models");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Is called by Stripe when a payment intent succeed
const webhookReceiver = async (req, res) => {
  try {
    switch (true) {
      case req.body.type === "payment_intent.succeeded":
        const data = req.body.data.object;

        if (data.status === "succeeded") {
          const paymentIntentId = data.id;
          const order = await Order.findOne({ stripePIId: paymentIntentId });

          order.isPaid = true;
          await order.save();
        }

        res.status(201).json({ result: true });
        break;
      default:
        console.error("unhandled case");
        res.json({ result: true, message: "unhandled case" });
        break;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const user = await User.findOne({ clerkUUID: req.auth.userId });
    let customer;
    if (user.stripeUUID) {
      customer = await stripe.customers.retrieve(user.stripeUUID);
    } else {
      // Use an existing Customer ID if this is a returning customer.
      customer = await stripe.customers.create({
        name: `${req.body.customer.firstname} ${req.body.customer.lastname}`,
        email: user.email,
      });

      user.stripeUUID = customer.id;
      await user.save();
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" },
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount * 100,
      currency: "eur",
      customer: customer.id,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter
      // is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const order = await createNewOrder(user, req.body.cart, paymentIntent.id);

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

const createNewOrder = async (user, cart, paymentIntentId) => {
  try {
    const details = cart.map((c) => {
      const products = c.products.map((p) => {
        return {
          product: p.stockData._id,
          quantity: p.quantity,
          isConfirmed: false,
        };
      });

      const withdrawMode = c.withdrawMode;

      return {
        shop: c.shop._id,
        withdrawMode,
        products,
      };
    });

    const newOrder = new Order({
      user: user._id,
      details,
      isWithdrawn: false,
      isPaid: false,
      stripePIId: paymentIntentId,
    });

    await newOrder.save();
    await newOrder.populate({
      path: "details",
      populate: {
        path: "shop",
        model: "shops",
        populate: { path: "notes", model: "notes" },
      },
    });
    return newOrder;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createPaymentIntent,
  webhookReceiver,
};
