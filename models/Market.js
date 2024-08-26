const mongoose = require("mongoose");
const addressSchema = require("./Address");
const openingHourSchema = require("./OpeningHour");

const marketSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  address: addressSchema,
  openingHours: [openingHourSchema],
});

const Market = mongoose.model("markets", marketSchema);

module.exports = Market;
