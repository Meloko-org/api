const mongoose = require("mongoose");

const shopInvoiceCounterSchema = mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shops",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

shopInvoiceCounterSchema.index({ shop: 1, year: 1 }, { unique: true });

const ShopInvoiceCounter = mongoose.model(
  "shopInvoicecounters",
  shopInvoiceCounterSchema,
);

module.exports = ShopInvoiceCounter;
