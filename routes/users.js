var express = require('express');
var router = express.Router();

const { userController } = require('../controllers')
const { clerkMiddlewares } = require('../middlewares')
const User = require('../models/User')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* Get user's infos if logged */
router.get('/logged', clerkMiddlewares.isUserLogged, userController.getUserInfos)


/* update user's info */
router.put('/logged', clerkMiddlewares.isUserLogged, userController.updateUser)

module.exports = router;
