var express = require("express");
var router = express.Router();
const { withdrawController } = require("../controllers");
const { clerkMiddleware } = require("@clerk/express");
const { clerkMiddlewares } = require("../middlewares");

router.put(
  "/activation",
  clerkMiddlewares.isUserLogged,
  withdrawController.activate,
);

module.exports = router;
