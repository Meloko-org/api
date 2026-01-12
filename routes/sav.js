var express = require("express");
var router = express.Router();
const { savController } = require("../controllers");
const { clerkMiddlewares } = require("../middlewares");

router.get(
  "/order/:id/update-picked-ud",
  clerkMiddlewares.isUserLogged,
  savController.updateOrderProductPickedUp,
);

module.exports = router;
