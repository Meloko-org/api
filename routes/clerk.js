var express = require('express');
var router = express.Router();
const { clerkMiddlewares } = require('../middlewares')
const { clerkController } = require('../controllers')

router.post('/webhook', clerkMiddlewares.isWebhookSignedByClerk, clerkController.webhookReceiver);

module.exports = router;
