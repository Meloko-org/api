var express = require("express");
var router = express.Router();
// const { typeController } = require("../controllers");
const typeController = require("../controllers/typeController");
const { clerkMiddlewares, rolesMiddleswares } = require("../middlewares");

router.post(
  "/",
  clerkMiddlewares.isUserLogged,
  rolesMiddleswares.isUserAdmin,
  typeController.createNewType,
);

router.get("/", typeController.getShopTypes);

router.get("/labels/", typeController.getTypeLabels);

module.exports = router;
