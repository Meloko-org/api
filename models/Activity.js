const mongoose = require("mongoose");

const activitySchema = mongoose.Schema({
  productType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "types",
    required: true,
  },
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
});

const Activity = mongoose.model("activities", activitySchema);

module.exports = Activity;
