const mongoose = require("mongoose");

const weightSchema = mongoose.Schema({
  unit: {
    type: String,
    required: true,
  },
  measurement: {
    type: Number,
    required: true,
  },
});

module.export = weightSchema;
