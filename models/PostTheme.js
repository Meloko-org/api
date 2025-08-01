const mongoose = require("mongoose");

const postThemeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    promptKey: {
      type: String,
      required: true,
    },
    promptContext: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    order: {
      type: Number,
      required: false,
    },
    type: {
      type: String,
      enum: ["product", "review", "activity"],
      required: true,
    },
  },
  { timestamps: true },
);

const PostTheme = mongoose.model("postthemes", postThemeSchema);

module.exports = PostTheme;
