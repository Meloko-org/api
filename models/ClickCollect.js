const mongoose = require("mongoose");
const openingHourSchema = require("./OpeningHour");

const clickCollectSchema = mongoose.Schema(
  {
    instructions: { type: String },
    openingHours: [openingHourSchema],
  },
  { timestamps: true },
);

module.exports = clickCollectSchema;
