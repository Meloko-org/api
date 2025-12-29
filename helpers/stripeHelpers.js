const { isUser } = require("../modules/verification");
const { validationModule } = require("../modules");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

module.exports = {
  createStripeCustomer,
  getStripeCustomer,
  canCreatePaymentIntent,
};
