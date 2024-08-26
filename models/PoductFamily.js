const mongoose = require("mongoose");

const productFamilySchema = mongoose.Schema(
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
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productcategory",
      default: null,
    },
  },
  { timestamps: true },
);

const ProductFamily = mongoose.model("productFamily", productFamilySchema);

module.exports = ProductFamily;
