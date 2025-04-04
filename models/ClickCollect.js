const mongoose = require("mongoose");
const openingHourSchema = require("./OpeningHour");

const clickCollectSchema = mongoose.Schema(
  {
    instructions: { type: String },
    isActive: {
      type: Boolean,
      default: false,
    },
    openingHours: [openingHourSchema],
  },
  { timestamps: true },
);

module.exports = clickCollectSchema;
