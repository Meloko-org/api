var express = require("express");
const { postThemeController } = require("../controllers");
var router = express.Router();

router.get("/", postThemeController.getThemes);

module.exports = router;
