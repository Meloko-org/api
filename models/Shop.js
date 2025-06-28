const mongoose = require("mongoose");
const addressSchema = require("./Address");
const clickCollectSchema = require("./ClickCollect");
const openingHours = require("../models/OpeningHour");

const shopMarketsSchema = mongoose.Schema({
  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "markets",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  openingHours: [openingHours],
});

const crewMembersSchema = mongoose.Schema({
  forname: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
  description: {
    type: String,
  },
  photo: {
    type: String,
  },
});

const shopSchema = mongoose.Schema(
  {
    producer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "producers",
    },
    name: {
      type: String,
      required: true,
    },
    siret: {
      type: String,
      required: true,
      unique: true,
    },
    address: addressSchema,
    logo: {
      type: String,
    },
    shortDesc: {
      type: String,
      required: true,
    },
    longDesc: {
      type: String,
      required: false,
    },
    photos: [
      {
        type: String,
      },
    ],
    video: [
      {
        type: String,
      },
    ],
    types: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "types",
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    reopenDate: {
      type: Date,
      default: null,
    },
    markets: [shopMarketsSchema],
    clickCollect: clickCollectSchema,
    notes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "notes",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    PremiumDate: {
      type: Date,
      default: null,
    },
    crew: [crewMembersSchema],
  },
  { timestamps: true },
);

const Shop = mongoose.model("shops", shopSchema);
module.exports = Shop;
