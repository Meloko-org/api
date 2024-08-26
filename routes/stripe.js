var express = require("express");
var router = express.Router();
const { clerkMiddlewares } = require("../middlewares");
const { stripeController } = require("../controllers");

router.post(
  "/paymentIntent",
  clerkMiddlewares.isUserLogged,
  stripeController.createPaymentIntent,
);

router.post("/webhook", stripeController.webhookReceiver);

module.exports = router;
