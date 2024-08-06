var express = require('express');
var router = express.Router();
const { shopController } = require('../controllers')
const { clerkAuthMiddleware } = require('../middlewares')

router.post('/', clerkAuthMiddleware, shopController.createNewShop);

module.exports = router;
