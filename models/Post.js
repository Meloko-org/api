const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shops",
      required: true,
    },
    type: {
      type: String,
      enum: ["product", "review", "activity"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    generatedContent: {
      type: String,
      required: true,
    },
    validatedContent: {
      type: String,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    mentions: {
      type: [String],
      default: [],
    },
    media: {
      type: [String], // URLs Cloudinary par exemple
      default: [],
    },
    networks: {
      instagram: { type: Boolean, default: false },
      facebook: { type: Boolean, default: false },
      tiktok: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["draft", "pending", "published", "failed"],
      default: "draft",
    },
    scheduledAt: {
      type: Date,
    },
    publishedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    isValidatedByProducer: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Post = mongoose.model("posts", postSchema);
module.exports = Post;
