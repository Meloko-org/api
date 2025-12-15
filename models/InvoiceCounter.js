const mongoose = require("mongoose");

const invoiceCounterSchema = mongoose.Schema({
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

invoiceCounterSchema.index({ year: 1 }, { unique: true });

const InvoiceCounter = mongoose.model("invoicecounters", invoiceCounterSchema);

module.exports = InvoiceCounter;
