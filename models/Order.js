const mongoose = require("mongoose");

const productDetailSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "stocks",
  },
  quantity: {
    type: Number,
    required: true,
  },
  isConfirmed: {
    type: Boolean,
    default: null,
  },
});

const orderDetailSchema = mongoose.Schema({
  products: [productDetailSchema],
  withdrawMode: {
    type: String,
    required: true,
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "markets",
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shops",
  },
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    details: [orderDetailSchema],
    isWithdrawn: {
      type: Boolean,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
    },
    stripePIId: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
