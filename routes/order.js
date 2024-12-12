var express = require("express");
var router = express.Router();
const { orderController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.put("/:id", clerkMiddlewares.isUserLogged, orderController.updateOrder);

router.get(
  "/:id",
  clerkMiddlewares.isUserLogged,
  orderController.getOrderDetailsById,
);

module.exports = router;
