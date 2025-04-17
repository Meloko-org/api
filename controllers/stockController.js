const mongoose = require("mongoose");
const { Stock, Shop, User } = require("../models");
const validationModule = require("../modules/validation");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");

const updateStock1 = async (req, res) => {
  try {
    const checkBodyFields = ["product", "shop", "stock", "price", "tags"];
    // faire une verification
    if (validationModule.checkBody(req.body, checkBodyFields)) {
      const { product, shop, stock, price, tags } = req.body;

      const shopData = await Shop.findOne({ _id: shop }).populate("producer");

      const user = await User.findOne({
        clerkUUID: "user_2kHhC1eGdQcKdPwk9hY2gz3kKHi",
      });

      // Si l'utilisateur n'est pas le proprietaire du shop concerné
      if (!shopData.producer.owner.equals(user._id)) {
        throw new Error("You do not have privileges to change this stock.");
      }

      // faire une recherche de stock pour le magasin et le produit
      let existingStock = await Stock.findOne({ product: product, shop: shop });

      // si le stock n'existe pas, on le crée
      if (!existingStock) {
        existingStock = new Stock({
          product,
          shop,
          stock,
          price,
          tags,
        });
      } else {
        // sinon mettre à jour le stock
        existingStock.stock = stock !== undefined ? stock : existingStock.stock;
        existingStock.price = price !== undefined ? price : existingStock.price;
        existingStock.tags = tags !== undefined ? tags : existingStock.tags;
      }

      await existingStock.save();

      res.json({ result: true, stock: existingStock });
    } else {
      throw new Error("Missing fields.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const createStocks = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found." });

    const { product, price, stock, description, tags, ...rest } = req.body;

    const newStock = new Stock({
      product: product._id,
      shop: shop._id,
      price: mongoose.Types.Decimal128.fromString(price.toString()),
      stock: mongoose.Types.Decimal128.fromString(stock.toString()),
      description,
      tags: tags.map((t) => t._id),
      ...rest,
    });

    await newStock.save();

    const populatedStock = await Stock.findById(newStock._id)
      .populate({
        path: "product",
        populate: {
          path: "family",
          model: "productFamily",
          populate: {
            path: "category",
            model: "productcategory",
          },
        },
      })
      .populate("tags");

    res.status(200).json({ success: true, product: populatedStock });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateStocks = async (req, res) => {
  console.log("updatestock :", req.body);
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const { _id, product, stock, price, description, tags, ...rest } = req.body;

    const updatedPrice = mongoose.Types.Decimal128.fromString(price.toString());

    const updatedStock = mongoose.Types.Decimal128.fromString(stock.toString());

    await Stock.findOneAndUpdate(
      { _id },
      {
        product: product._id,
        shop: shop._id,
        price: updatedPrice,
        stock: updatedStock,
        description,
        tags: tags.map((t) => t._id),
        ...rest,
      },
      { new: true },
    );

    const updatedProduct = await Stock.findById(_id)
      .populate({
        path: "product",
        populate: {
          path: "family",
          model: "productFamily",
          populate: { path: "category", model: "productcategory" },
        },
      })
      .populate("tags");

    res.status(200).json({ success: true, updatedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: true, message: "Internal server error" });
    return;
  }
};

const getStocksByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: "No shop found" });
    }

    // Recherche
    const stocks = await Stock.find({ shop: shopId })
      .populate({
        path: "product",
        populate: {
          path: "family",
          model: "productFamily",
          populate: { path: "category", model: "productcategory" },
        },
      })
      .populate("tags");
    // .populate({
    //   path: "shop",
    //   populate: {
    //     path: "producer",
    //     model: "producers",
    //   },
    // });

    if (!stocks) {
      return res
        .status(404)
        .json({ status: false, message: "Aucun produit pour ce shop." });
    }

    // console.log("stocks :", JSON.stringify(stocks, null, 2));

    res.status(200).json({ success: true, stocks });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

module.exports = {
  createStocks,
  updateStocks,
  getStocksByShop,
};
