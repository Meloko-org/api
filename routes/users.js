var express = require('express');
var router = express.Router();
const { userController } = require('../controllers')
const { clerkMiddlewares } = require('../middlewares')

/* GET users infos. */
router.get(
  '/getuserinfos',
  clerkMiddlewares.isUserLogged,
  userController.getUserInfos
);

module.exports = router;
