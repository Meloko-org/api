var express = require("express");
var router = express.Router();
const { tagController } = require("../controllers");
const { clerkMiddlewares, rolesMiddleswares } = require("../middlewares");

router.post(
  "/",
  clerkMiddlewares.isUserLogged,
  rolesMiddleswares.isUserAdmin,
  tagController.createNewTag,
);

router.get("/suggested/:familyId", tagController.getSuggestedTags);

module.exports = router;
