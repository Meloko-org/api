var express = require("express");
const { shopFeaturesController } = require("../controllers");
var router = express.Router();

router.get("/", shopFeaturesController.getShopfeatures);

module.exports = router;
