const mongoose = require("mongoose");
const { decimalNumberPlugin } = require("../plugins/decimalNumberPlugin");

const addressSchema = require("./Address");

const favsearchSchema = mongoose.Schema(
  {
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        default: null,
      },
    ],
    productsCats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        default: null,
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tags",
        default: null,
      },
    ],
    isMyPosition: {
      type: Boolean,
      default: false,
    },
    radius: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);

const userAddressSchema = mongoose.Schema(
  {
    address: addressSchema,
    name: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    clerkUUID: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    clerkPasswordEnabled: {
      type: String,
      required: true,
    },
    stripeUUID: {
      type: String,
      unique: true,
    },
    roles: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "roles",
      required: true,
    },
    firstname: {
      type: String,
      default: null,
    },
    lastname: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    bookmarks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "shops",
    },
    addresses: [userAddressSchema],
    favSearch: [favsearchSchema],
  },
  { timestamps: true },
);

// userSchema.plugin(decimalNumberPlugin)

const User = mongoose.model("users", userSchema);

module.exports = User;
