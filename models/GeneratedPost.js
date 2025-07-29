const mongoose = require("mongoose");

const generatedPostSchema = mongoose.Schema(
  {
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    generatedText: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    networks: [
      {
        type: String,
        enum: ["facebook", "instagram", "tiktok"],
        required: true,
      },
    ],
    theme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostTheme",
    },
    productTags: [String],
    globalTags: [String],
    globalMentions: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const GeneratedPost = mongoose.model("generatedposts", generatedPostSchema);
module.exports = GeneratedPost;
