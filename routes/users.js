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

/* add a shop to the user's bookmarks */
router.post('/bookmarks/:shopId', clerkMiddlewares.isUserLogged, userController.addShopToBookmark)

/* remove a shop from the user's bookmarks */
router.delete('/bookmarks/:shopId', clerkMiddlewares.isUserLogged, userController.removeShopFromBookmark)

module.exports = router;
