var express = require('express');
var router = express.Router();
const { clerkMiddlewares } = require('../middlewares')
const { stripeController } = require('../controllers')

router.post('/paymentIntent', stripeController.createPaymentIntent);

module.exports = router;
