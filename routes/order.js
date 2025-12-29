var express = require("express");
var router = express.Router();
const { orderController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.get(
  "/user/:id",
  clerkMiddlewares.isUserLogged,
  orderController.getUserOrderById,
);

router.get(
  "/user",
  clerkMiddlewares.isUserLogged,
  orderController.getOrdersByUser,
);

router.post(
  "/:id/update-sub-order",
  clerkMiddlewares.isUserLogged,
  orderController.updateSubOrder,
);

router.get(
  "/:id",
  clerkMiddlewares.isUserLogged,
  orderController.getOrderDetailsById,
);

module.exports = router;
