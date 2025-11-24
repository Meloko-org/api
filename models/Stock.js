const mongoose = require("mongoose");
const { decimal128ToJSON } = require("../helpers/decimalHelpers");
const { numberToDecimal128 } = require("../helpers/decimalHelpers");

const stockSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shops",
      required: true,
    },
    productCustomName: {
      type: String,
      required: false,
    },
    stock: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    pricePerKilo: {
      type: Number,
      required: false,
    },
    weightPerUnit: {
      type: String,
      required: false,
    },
    origin: {
      type: String,
      required: false,
    },
    format: {
      type: String,
      required: false,
    },
    portion: {
      type: String,
      required: false,
    },
    bestBeforeDate: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: String,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tags",
      },
    ],
    isDeleted: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true },
);

// decimal128ToJSON(stockSchema);
// numberToDecimal128(stockSchema);

const Stock = mongoose.model("stocks", stockSchema);
module.exports = Stock;
