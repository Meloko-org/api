const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.post('/update', stockController.updateStock);

module.exports = router;
