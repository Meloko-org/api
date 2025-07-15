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

router.post(
  "/update",
  clerkMiddlewares.isUserLogged,
  shopController.updateShop,
);

router.put(
  "/clickCollect",
  clerkMiddlewares.isUserLogged,
  shopController.updateClickCollect,
);

router.put(
  "/offline",
  clerkMiddlewares.isUserLogged,
  shopController.updateOffline,
);

router.put(
  "/updateTypes",
  clerkMiddlewares.isUserLogged,
  shopController.updateTypes,
);

// Search for shops based on various parameters
// router.post("/search", shopController.searchShops);
router.post("/search", shopController.searchShopsOrMarkets);
// search for markets based on city or department
router.post("/markets", shopController.searchMarkets);
// add a market to a shop
router.put("/markets/add", shopController.addMarkets);
// update existing markets
router.put("/markets/update", shopController.updateShopMarkets);
// get market by id
router.get("/markets/:marketId", shopController.getMarketById);
// add products to a shop
router.post(
  "/add-products",
  clerkMiddlewares.isUserLogged,
  shopController.addProductsToAShop,
);

router.post(
  "/available-products",
  clerkMiddlewares.isUserLogged,
  shopController.getAvailableProductsForAShop,
);

router.get("/:id", shopController.getById);

router.get(
  "/:shopId/stocks-by-category/:categoryName",
  shopController.getStocksByShopAndCategory,
);

router.get(
  "/myshop/:producer",
  clerkMiddlewares.isUserLogged,
  shopController.getByProducer,
);

router.delete(
  "/:shopId",
  clerkMiddlewares.isUserLogged,
  // rolesMiddleswares.isUserAdmin,
  shopController.deleteShop,
);

router.patch(
  "/socials/networks",
  clerkMiddlewares.isUserLogged,
  shopController.updateSocialNetworks,
);

router.patch(
  "/socialPostSettings",
  clerkMiddlewares.isUserLogged,
  shopController.updateSocialPostSettings,
);

router.get(
  "/socialPostSettings/hashtags",
  clerkMiddlewares.isUserLogged,
  shopController.getAvailableHashtags,
);

module.exports = router;
