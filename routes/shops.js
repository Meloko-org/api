var express = require('express');
var router = express.Router();
const { shopController } = require('../controllers')
const { clerkMiddlewares } = require('../middlewares')

router.post('/', clerkMiddlewares.isUserLogged, shopController.createNewShop);

module.exports = router;
