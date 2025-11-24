var express = require("express");
var router = express.Router();
const { clerkMiddlewares } = require("../middlewares");
const { stripeController } = require("../controllers");

// nouvelle méthode selon la doc
router.post(
  "/customer-session",
  clerkMiddlewares.isUserLogged,
  stripeController.createCustomerSession,
);
router.post(
  "/payment-sheet",
  clerkMiddlewares.isUserLogged,
  stripeController.paymentSheet,
);

// ancien code
router.post(
  "/paymentIntent",
  clerkMiddlewares.isUserLogged,
  stripeController.createPaymentIntent,
);

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json"}),
//   stripeController.webhookReceiver
// );

module.exports = router;
