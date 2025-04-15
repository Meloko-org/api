const { ProductFamily } = require("../models");
const ProductCategory = require("../models/ProductCategory");

const getAllCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find(
      {},
      { _id: 0, name: 1, type: 1 },
    );

    res.status("200").json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ succes: false, message: error.message });
    return;
  }
};

const getProductsTypesByCategory = async (req, res) => {
  try {
    const families = await ProductFamily.find().populate("category");

    const mapping = new Map();

    for (const family of families) {
      const categoryName = family.category?.name;
      const types = family.productsTypes || []; // ex: ["bulk", "classic"]

      if (!categoryName) continue;

      if (!mapping.has(categoryName)) {
        mapping.set(categoryName, new Set());
      }

      types.forEach((type) => mapping.get(categoryName).add(type));
    }

    // Convertit la map en objet classique
    const result = {};
    for (const [category, typesSet] of mapping.entries()) {
      result[category] = Array.from(typesSet);
    }

    console.log(result);

    res.json({ success: true, categories: result });
  } catch (error) {
    console.error("Erreur dans /categories/products-types:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

module.exports = {
  getAllCategories,
  getProductsTypesByCategory,
};
