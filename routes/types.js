var express = require('express');
var router = express.Router();
const { typeController } = require('../controllers')
const { clerkAuthMiddleware } = require('../middlewares')

router.post('/', clerkAuthMiddleware, typeController.createNewType);

module.exports = router;
