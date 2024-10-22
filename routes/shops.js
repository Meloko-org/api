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

// search for markets based on city or department
router.post("/markets", shopController.searchMarkets);
// add a market to a shop
router.put("/markets/add", shopController.addMarkets);
// update existing markets
router.put("/markets/update", shopController.updateShopMarkets);

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
