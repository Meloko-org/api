const { ProductCategory, ProductFamily } = require("../models");

const getFamiliesByCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    console.log("category : ", categoryName);

    const category = await ProductCategory.findOne({ name: categoryName });

    console.log("cat id :", category._id);

    const families = await ProductFamily.find({ category: category._id });

    console.log("les familles :", families);

    res.status(200).json({ success: true, families });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getFamiliesByCategory,
};
