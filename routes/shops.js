var express = require('express');
var router = express.Router();
const { shopController } = require('../controllers')
const { clerkMiddlewares } = require('../middlewares')

// POST ROUTES

// Create a new shop
// Only logged users
router.post(
  '/', 
  clerkMiddlewares.isUserLogged, 
  shopController.createNewShop
);

// Search for shops based on various parameters
router.post(
  '/search', 
  shopController.searchShops
);

module.exports = router;
