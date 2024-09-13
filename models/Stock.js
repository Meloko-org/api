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
    stock: {
      type: mongoose.Decimal128,
      required: true,
    },
    price: {
      type: mongoose.Decimal128,
      required: true,
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
