var express = require('express');
var router = express.Router();
const { tagController } = require('../controllers')
const { clerkMiddlewares, rolesMiddleswares } = require('../middlewares')

router.post(
  '/',  
  clerkMiddlewares.isUserLogged, 
  rolesMiddleswares.isUserAdmin,  
  tagController.createNewTag
);

module.exports = router;
