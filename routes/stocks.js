var express = require('express');
var router = express.Router();
const { stockController } = require('../controllers');
const { clerkMiddlewares } = require('../middlewares')


router.post(
  '/update', 
 // clerkMiddlewares.isUserLogged, 
  stockController.updateStock
);

router.get(
  '/:shopId', 
  //clerkMiddlewares.isUserLogged, 
  stockController.updateStock
);


//clerkUUID "user_2kHhC1eGdQcKdPwk9hY2gz3kKHi"
module.exports = router;
