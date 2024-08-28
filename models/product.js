const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    family: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productFamily",
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("products", productSchema);
module.exports = Product;
