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
  withdrawMarket: {
    type: String,
  },
  withdrawDay: {
    type: String,
  },
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "markets",
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shops",
  },
  shopTotalPrice: {
    type: mongoose.Decimal128,
    required: true,
  },
  status: {
    type: String,
    required: true,
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
    totalPrice: {
      type: mongoose.Decimal128,
      required: true,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
