var express = require('express');
var router = express.Router();
const { stockController } = require('../controllers');
const { clerkMiddlewares } = require('../middlewares')


router.post(
  '/update', 
  clerkMiddlewares.isUserLogged, 
  stockController.updateStock
);
router.get('/:shopId', clerkMiddlewares.isUserLogged, 
  stockController.getStocks);

  
module.exports = router;
