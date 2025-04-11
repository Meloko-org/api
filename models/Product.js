const mongoose = require("mongoose");
const weightSchema = require("./Weight");

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
    weight: {
      type: weightSchema,
      required: true,
    },
    hasCustomName: {
      type: Boolean,
      required: true,
    },
    suggestedTags: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tags",
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("products", productSchema);
module.exports = Product;
