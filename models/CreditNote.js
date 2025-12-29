const mongoose = require("mongoose");

const creditNoteLineSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "stocks",
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
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

const creditNoteSchema = mongoose.Schema(
  {
    creditNoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "invoices",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shops",
      required: true,
    },
    issuedAt: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
    },
    lines: {
      type: [creditNoteLineSchema],
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
  { timestamps: true },
);

const CreditNote = mongoose.model("creditnotes", creditNoteSchema);
module.exports = CreditNote;
