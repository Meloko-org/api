var express = require("express");
var router = express.Router();
const { roleController } = require("../controllers");
const { clerkMiddlewares, rolesMiddleswares } = require("../middlewares");

router.post(
  "/",
  clerkMiddlewares.isUserLogged,
  rolesMiddleswares.isUserAdmin,
  roleController.createNewRole,
);

module.exports = router;
