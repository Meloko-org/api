var express = require('express');
var router = express.Router();
const { producerController } = require('../controllers')
const { clerkAuthMiddleware } = require('../middlewares')

router.post('/', clerkAuthMiddleware, producerController.createNewProducer);

module.exports = router;
