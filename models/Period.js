const mongoose = require('mongoose');

const periodSchema = mongoose.Schema({
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true }
  })

module.exports = periodSchema