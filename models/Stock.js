const mongoose = require("mongoose");

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
      type: mongoose.Decimal128,
      required: true,
    },
    price: {
      type: mongoose.Decimal128,
      required: true,
    },
    pricePerKilo: {
      type: mongoose.Decimal128,
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
  },
  { timestamps: true },
);

const Stock = mongoose.model("stocks", stockSchema);
module.exports = Stock;
