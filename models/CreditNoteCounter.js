const mongoose = require("mongoose");

const creditNoteCounterSchema = mongoose.Schema(
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

creditNoteCounterSchema.index({ shop: 1, year: 1 }, { unique: true });

const CreditNoteCounter = mongoose.model(
  "creditnotecounters",
  creditNoteCounterSchema,
);

module.exports = CreditNoteCounter;
