const mongoose = require("mongoose");

const generatedPostSchema = mongoose.Schema(
  {
    subjectType: {
      type: String,
      enum: ["product", "review", "activity"],
      required: true,
    },
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
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
