const { Product, ProductCategory, ProductFamily } = require("../models");
const { validationModule } = require("../modules");

const createNewProductCategory = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = ["name", "description", "image"];

    // If all expected fields are present
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      // Create and save the new product category
      const { name, description, image } = req.body;

      const newProductCategory = new ProductCategory({
        name,
        description,
        image,
      });

      await newProductCategory.save();

      res.json({ result: true, productCategory: newProductCategory });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const createNewProductFamily = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = ["name", "description", "image", "category"];

    // If all expected fields are present
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      // Create and save the new product family
      const { name, description, image, category } = req.body;

      const newProductFamily = new ProductFamily({
        name,
        description,
        image,
        category,
      });

      await newProductFamily.save();

      res.json({ result: true, productFamily: newProductFamily });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

const createNewProduct = async (req, res) => {
  try {
    // define the fields coming from req.body to check
    const checkBodyFields = ["name", "description", "image", "family"];

    // If all expected fields are present
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      // Create and save the new product
      const { name, description, image, family } = req.body;

      const newProduct = new Product({
        name,
        description,
        image,
        family,
      });

      await newProduct.save();

      res.json({ result: true, product: newProduct });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
    return;
  }
};

module.exports = {
  createNewProductCategory,
  createNewProductFamily,
  createNewProduct,
};
