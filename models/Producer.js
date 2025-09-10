const mongoose = require("mongoose");
const addressSchema = require("./Address");

const producerSchema = mongoose.Schema(
  {
    socialReason: {
      type: String,
      required: false,
    },
    siren: {
      type: String,
      required: false,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    iban: {
      type: String,
      required: false,
      length: 34,
    },
    bic: {
      type: String,
      required: false,
      length: 11,
    },
    address: {
      type: addressSchema,
      required: false,
    },
    onboardingStep: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

const Producer = mongoose.model("producers", producerSchema);
module.exports = Producer;
