const mongoose = require("mongoose");
const addressSchema = require("./Address");

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

const creditNoteSchema = mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shops",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orders",
      required: true,
    },
    subOrder: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    creditNoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    issuedAt: {
      type: Date,
      required: true,
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "invoices",
      default: null,
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
    stripeRefundId: {
      type: String,
    },
    refundedAt: {
      type: Date,
    },
    stripeRefundId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "issued", "refunded", "failed"],
      default: "pending",
    },
    failureReason: {
      type: String,
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
