var express = require('express');
var router = express.Router();
const { clerkWebhookVerifyMiddleware } = require('../middlewares')
const { clerkController } = require('../controllers')

router.post('/webhook', clerkWebhookVerifyMiddleware, clerkController.webhookReceiver);

module.exports = router;
