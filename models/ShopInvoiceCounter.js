const mongoose = require("mongoose");

const shopInvoiceCounterSchema = mongoose.Schema({
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

const ShopInvoiceCounter = mongoose.model(
  "shopInvoicecounters",
  shopInvoiceCounterSchema,
);

module.exports = ShopInvoiceCounter;
