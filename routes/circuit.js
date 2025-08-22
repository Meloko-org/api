var express = require("express");
const { circuitController } = require("../controllers");
var router = express.Router();

router.post("/", circuitController.getCircuit);

module.exports = router;
