const mongoose = require("mongoose");

const shopFeaturesSchema = mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  icon: {
    type: String,
  },
});

const ShopFeatures = mongoose.model("shopfeatures", shopFeaturesSchema);
module.exports = ShopFeatures;
