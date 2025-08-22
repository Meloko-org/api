const ShopFeatures = require("../models/ShopFeatures");

const getShopfeatures = async (req, res) => {
  try {
    const features = await ShopFeatures.find();

    res.status(200).json({ success: true, features });
  } catch (error) {
    console.log(error);
    res.status(404).json({ success: true, message: error });
  }
};

module.exports = {
  getShopfeatures,
};
