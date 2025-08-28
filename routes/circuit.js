var express = require("express");
const { circuitController } = require("../controllers");
var router = express.Router();

router.post("/", circuitController.getCircuit);

router.post("/update", circuitController.updateCircuit);

router.post("/addnote", circuitController.addNoteFromCircuit);

module.exports = router;
