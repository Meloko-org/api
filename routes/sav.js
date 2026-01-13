var express = require("express");
var router = express.Router();
const { savController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.post(
  "/order/:id/update-picked-up",
  clerkMiddlewares.isUserLogged,
  savController.updateOrderProductPickedUp,
);

router.post(
  "/order/:orderId/refund",
  clerkMiddlewares.isUserLogged,
  savController.refund,
);

module.exports = router;
