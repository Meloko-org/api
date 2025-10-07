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

const socialNetworkSchema = new mongoose.Schema(
  {
    connected: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: false },
    accessToken: { type: String }, // Token d'accès OAuth
    refreshToken: { type: String }, // Token pour rafraîchir l'accès si applicable
    userId: { type: String }, // ID du compte (ou page)
    username: { type: String }, // Nom public (ex: @fermeduchamp)
    pageId: { type: String }, // Spécifique à Facebook
    pageName: { type: String }, // Spécifique à Facebook
    expiresAt: { type: Date }, // Si applicable
  },
  { _id: false },
); // Pas besoin d’ID pour les sous-documents ici

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
    marketsPreviouslyActive: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
      },
    ],
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
    socials: {
      instagram: { type: socialNetworkSchema, default: () => ({}) },
      facebook: { type: socialNetworkSchema, default: () => ({}) },
      tiktok: { type: socialNetworkSchema, default: () => ({}) },
    },
    socialPostSettings: {
      frequency: {
        mode: {
          type: String,
          enum: ["manual", "reminder"],
          default: "manual",
        },
        timesPerWeek: {
          type: Number,
          default: 0,
        },
        preferredDays: {
          type: [String],
          default: [],
        },
      },
      customHashtags: {
        type: [String],
        default: [],
      },
      customMentions: {
        type: [String],
        default: [],
      },
    },
    features: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "shopfeatures",
    },
  },
  { timestamps: true },
);

const Shop = mongoose.model("shops", shopSchema);
module.exports = Shop;
