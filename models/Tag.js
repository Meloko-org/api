const mongoose = require("mongoose");

const tagSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tagCategories",
    },
  },
  { timestamps: true },
);

const Tag = mongoose.model("tags", tagSchema);
module.exports = Tag;
