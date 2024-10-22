const mongoose = require("mongoose");

const periodSchema = mongoose.Schema({
  openingTime: { type: String, required: false },
  closingTime: { type: String, required: false },
});

module.exports = periodSchema;
