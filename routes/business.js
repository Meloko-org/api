var express = require("express");
var router = express.Router();
const { businessController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.get(
  "/all",
  clerkMiddlewares.isUserLogged,
  businessController.getAllOrders,
);

router.get(
  "/lastthree",
  clerkMiddlewares.isUserLogged,
  businessController.getLastThreeOrders,
);

module.exports = router;
