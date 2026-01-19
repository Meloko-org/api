var express = require("express");
var router = express.Router();
const { clerkMiddlewares } = require("../middlewares");
const { pushTokenController } = require("../controllers");

router.post(
  "/users/push-token",
  clerkMiddlewares.isUserLogged,
  pushTokenController.registerPushToken,
);

module.exports = router;
