const mongoose = require("mongoose");

const weightSchema = mongoose.Schema(
  {
    unit: {
      type: String,
      required: true,
      unique: true,
    },
    measurement: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
  },
  { timestamps: true },
);

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
      require: true,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("products", productSchema);
module.exports = Product;
