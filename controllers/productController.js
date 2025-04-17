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

const getProductById = async (req, res) => {
  console.log("product id :", req.params.id);
  try {
    const checkBodyFields = ["id"];

    if (!validationModule.checkBody(req.params, checkBodyFields)) {
      throw new Error("Missing fields.");
    }

    const product = await Product.findById(req.params.id).populate(
      "family",
      "name",
    );

    if (!product) {
      throw new Error("No product found.");
    }

    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getProductsForFamily = async (req, res) => {
  try {
    const { familyName } = req.params;

    console.log(familyName);

    const family = await ProductFamily.findOne({ name: familyName });

    console.log(family);

    const products = await Product.find({ family: family._id }).populate({
      path: "family",
      match: { _id: family._id },
    });

    console.log(products);

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getProductsForCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    const category = await ProductCategory.findOne({ name: categoryName });
    console.log("la cat :", category);

    const products = await Product.aggregate([
      {
        $lookup: {
          from: "productfamilies", // attention au nom exact de la collection !
          localField: "family",
          foreignField: "_id",
          as: "family",
        },
      },
      { $unwind: "$family" },
      {
        $lookup: {
          from: "productcategories",
          localField: "family.category",
          foreignField: "_id",
          as: "family.category",
        },
      },
      { $unwind: "$family.category" },
      {
        $match: {
          "family.category._id": category._id,
        },
      },
    ]);

    console.log(products);

    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createNewProductCategory,
  createNewProductFamily,
  createNewProduct,
  getProductById,
  getProductsForFamily,
  getProductsForCategory,
};
