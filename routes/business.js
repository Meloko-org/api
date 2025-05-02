var express = require("express");
var router = express.Router();
const { businessController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.get(
  "/summary",
  clerkMiddlewares.isUserLogged,
  businessController.getOrderSummary,
);

router.get(
  "/orders",
  clerkMiddlewares.isUserLogged,
  businessController.getOrders,
);

router.get(
  "/lastthree",
  clerkMiddlewares.isUserLogged,
  businessController.getLastThreeOrders,
);

module.exports = router;
