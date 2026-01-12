const mongoose = require("mongoose");
const { decimalNumberPlugin } = require("../plugins/decimalNumberPlugin");

const productDetailSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "stocks",
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    enum: ["gr", "piece"],
    required: true,
  },
  unitPriceTTC: {
    type: Number,
    required: true,
  },
  unitPriceHT: {
    type: Number,
    required: true,
  },
  vatRate: {
    type: Number,
    required: true,
  },
  vatAmount: {
    type: Number,
    required: true,
  },
  totalPriceTTC: {
    type: Number,
    required: true,
  },
  productStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  pickedUp: {
    type: Boolean,
    defaul: null,
  },
  refunded: {
    type: Boolean,
    default: false,
  },
  refundReason: {
    type: String,
  },
  refundedAt: {
    type: Date,
  },
  refundCreditNote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "creditNotes",
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
  shopTotalHT: {
    type: Number,
    required: true,
  },
  shopTotalVAT: {
    type: Number,
    required: true,
  },
  shopTotalTTC: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "prepared",
      "partially_prepared",
      "cancelled",
      "picked_up",
      "partially_picked_up",
    ],
    required: true,
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "invoices",
    default: null,
  },
  creditNotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "creditnotes",
      default: null,
    },
  ],
  stockIssue: {
    type: Boolean,
    default: false,
  },
  stockIssueProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "stocks",
  },
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    billingAddress: {
      name: {
        type: String,
      },
      address1: {
        type: String,
        required: true,
      },
      address2: {
        type: String,
      },
      postalCode: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      latitude: mongoose.Decimal128,
      longitude: mongoose.Decimal128,
    },
    shippingAddres: {
      type: {
        name: {
          type: String,
        },
        address1: {
          type: String,
          // required: true,
        },
        address2: {
          type: String,
        },
        postalCode: {
          type: String,
          // required: true,
        },
        city: {
          type: String,
          // required: true,
        },
        country: {
          type: String,
          // required: true,
        },
        latitude: mongoose.Decimal128,
        longitude: mongoose.Decimal128,
      },
      default: null,
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
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
      index: true,
      default: null,
    },
    // stripePIId: {
    //   type: String,
    //   unique: true,
    // },
    totalHT: {
      type: Number,
      required: true,
    },
    totalVAT: {
      type: Number,
      required: true,
    },
    totalTTC: {
      type: Number,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
