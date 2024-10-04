var express = require("express");
var router = express.Router();
const { shopController } = require("../controllers");
const { clerkMiddlewares, rolesMiddleswares } = require("../middlewares");

// POST ROUTES

// Create a new shop
// Only logged users
router.post(
  "/",
  clerkMiddlewares.isUserLogged,
  shopController.createOrUpdateShop,
);

router.put(
  "/clickCollect",
  clerkMiddlewares.isUserLogged,
  shopController.updateClickCollect,
);

// Search for shops based on various parameters
router.post("/search", shopController.searchShops);

router.get("/:id", shopController.getById);

router.get(
  "/myshop/:producer",
  clerkMiddlewares.isUserLogged,
  shopController.getByProducer,
);

router.delete(
  "/:shopId",
  clerkMiddlewares.isUserLogged,
  rolesMiddleswares.isUserAdmin,
  shopController.deleteShop,
);

module.exports = router;
