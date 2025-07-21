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
  },
  { timestamps: true },
);

const PostTheme = mongoose.model("postthemes", postThemeSchema);

module.exports = PostTheme;
