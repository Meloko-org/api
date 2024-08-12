const { User } = require('../models');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// stripe.customers.create({
//   email: 'customer@example.com',
// })
//   .then(customer => console.log(customer.id))
//   .catch(error => console.error(error));

const createPaymentIntent = async (req, res) => {
  try {
    const user = await User.findOne({ clerkUUID: req.auth.userId})
    let customer
    if(user.stripeUUID) {
      customer = await stripe.customers.retrieve(user.stripeUUID);
    } else {
      // Use an existing Customer ID if this is a returning customer.
      customer = await stripe.customers.create({
        name: `${req.body.customer.firstname} ${req.body.customer.lastname}`,
        email: user.email,
      });

      user.stripeUUID = customer.id
      await user.save()
    }


    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2024-06-20'}
    );

    console.log("total", req.body.amount)
    console.log(req.body)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount * 100,
      currency: 'eur',
      customer: customer.id,
      // In the latest version of the API, specifying the `automatic_payment_methods` parameter
      // is optional because Stripe enables its functionality by default.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message})
    return
  }

}

module.exports = {
  createPaymentIntent
}