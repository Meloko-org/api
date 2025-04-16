var express = require("express");
var router = express.Router();
const { familyController } = require("../controllers");

router.get("/category/:categoryName", familyController.getFamiliesByCategory);

module.exports = router;
