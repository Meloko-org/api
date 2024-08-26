var express = require('express');
var router = express.Router();
const { typeController } = require('../controllers')
const { clerkMiddlewares, rolesMiddleswares } = require('../middlewares')

router.post(
  '/',  
  clerkMiddlewares.isUserLogged, 
  rolesMiddleswares.isUserAdmin,  
  typeController.createNewType
);

router.get('/', typeController.getShopTypes)

module.exports = router;
