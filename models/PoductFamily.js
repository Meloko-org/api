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
      required: false,
    },
    productsTypes: {
      type: [String],
      enum: ["bulk", "classic", "both"],
      required: true,
      default: ["classic"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productcategory",
      default: null,
    },
    tagCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tagCategories",
      },
    ],
  },
  { timestamps: true },
);

const ProductFamily = mongoose.model("productFamily", productFamilySchema);

module.exports = ProductFamily;
