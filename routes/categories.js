var express = require("express");
var router = express.Router();
const { categoryController } = require("../controllers");

router.get("/", categoryController.getAllCategories);

module.exports = router;
