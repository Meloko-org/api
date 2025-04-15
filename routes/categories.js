var express = require("express");
var router = express.Router();
const { categoryController } = require("../controllers");

router.get("/", categoryController.getAllCategories);

router.get("/products-types", categoryController.getProductsTypesByCategory);

module.exports = router;
