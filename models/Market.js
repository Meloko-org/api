const mongoose = require("mongoose");
const addressSchema = require("./Address");

const marketSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  address: addressSchema,
});

const Market = mongoose.model("markets", marketSchema);

module.exports = Market;
