var express = require("express");
var router = express.Router();
const { businessController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.get(
  "/all",
  clerkMiddlewares.isUserLogged,
  businessController.getAllOrders,
);

module.exports = router;
