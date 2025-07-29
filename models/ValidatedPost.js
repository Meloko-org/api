const mongoose = require("mongoose");

const validatedPostSchema = mongoose.Schema(
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
    type: {
      type: String,
      enum: ["product", "review", "activity"],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    generatedText: {
      type: String,
      required: true,
    },
    editedText: {
      type: String,
    },
    productTags: [String],
    globalTags: [String],
    globalMentions: [String],
    networks: [String],
    scheduledFor: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "posted", "error"],
      default: "draft",
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const ValidatedPost = mongoose.model("validatedposts", validatedPostSchema);
module.exports = ValidatedPost;
