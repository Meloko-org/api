var express = require('express');
var router = express.Router();
const { producerController } = require('../controllers')
const { clerkMiddlewares } = require('../middlewares')

router.post('/', clerkMiddlewares.isUserLogged, producerController.createNewProducer);

router.get('/:producer', producerController.searchProducer);

module.exports = router;
