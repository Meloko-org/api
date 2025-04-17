const { ProductCategory, ProductFamily } = require("../models");

const getFamiliesByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    const category = await ProductCategory.findOne({ name: categoryName });

    const families = await ProductFamily.find({ category: category._id });

    res.status(200).json({ success: true, families });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getFamiliesByCategory,
};
