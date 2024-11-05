const ProductCategory = require("../models/ProductCategory");

const getAllCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find({}, { _id: 0, name: 1 });
    res.status("200").json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

module.exports = {
  getAllCategories,
};
