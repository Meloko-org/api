const mongoose = require("mongoose");

const orderCounterSchema = mongoose.Schema({
  year: {
    type: Number,
    required: true,
  },
  sequence: {
    type: Number,
    required: true,
    default: 0,
  },
});

orderCounterSchema.index({ year: 1 }, { unique: true });

const OrderCounter = mongoose.model("ordercounters", orderCounterSchema);

module.exports = OrderCounter;
