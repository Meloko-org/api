const mongoose = require("mongoose");
const addressSchema = require("./Address");

const invoiceLineSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    unitPriceHT: {
      type: Number,
      required: true,
    },
    vatRate: {
      type: Number,
      required: true,
    },
    totalHT: {
      type: Number,
      required: true,
    },
    totalVAT: {
      type: Number,
      required: true,
    },
    totalTTC: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const invoiceSchema = mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shops",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      required: true,
      index: true,
    },
    subOrder: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currency: {
      type: String,
      default: "EUR",
    },
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      address: {
        type: addressSchema,
        required: true,
      },
    },
    seller: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: addressSchema,
        required: true,
      },
      vatNumber: {
        type: String,
        required: true,
      },
    },
    lines: {
      type: [invoiceLineSchema],
      required: true,
    },
    totalHT: {
      type: Number,
      required: true,
    },
    totalVAT: {
      type: Number,
      required: true,
    },
    totalTTC: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["issued", "credited"],
      default: "issued",
      required: true,
    },
  },
  { timestamps: true },
);

const Invoice = mongoose.model("invoices", invoiceSchema);
module.exports = Invoice;
