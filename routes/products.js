var express = require("express");
var router = express.Router();
const { productController } = require("../controllers");
const { clerkMiddlewares, rolesMiddleswares } = require("../middlewares");

// POST ROUTES

// Create a new product
// Admin only
router.post(
  "/",
  // clerkMiddlewares.isUserLogged,
  // rolesMiddleswares.isUserAdmin,
  productController.createNewProduct,
);

// Create a new product family
// Admin only
router.post(
  "/family",
  // clerkMiddlewares.isUserLogged,
  // rolesMiddleswares.isUserAdmin,
  productController.createNewProductFamily,
);

// Create a new product category
// Admin only
router.post(
  "/category",
  // clerkMiddlewares.isUserLogged,
  // rolesMiddleswares.isUserAdmin,
  productController.createNewProductCategory,
);

module.exports = router;
