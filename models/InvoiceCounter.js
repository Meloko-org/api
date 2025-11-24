const mongoose = require("mongoose");

const invoiceCounterSchema = mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true,
  },
  sequence: {
    type: Number,
    required: true,
    default: 0,
  },
});

const InvoiceCounter = mongoose.model("invoicecounters", invoiceCounterSchema);

module.exports = InvoiceCounter;
