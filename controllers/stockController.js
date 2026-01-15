const mongoose = require("mongoose");
const { Stock, Shop, User } = require("../models");
const validationModule = require("../modules/validation");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");
const { eurosToCents } = require("../helpers/priceHelpers");

const createStocks = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "Shop not found." });

    const { product, price, stock, description, tags, ...rest } = req.body;

    if (!price || !stock) {
      return res.status(404).json({
        success: false,
        message: "Des informations sont manquantes. (prix, quantité)",
      });
    }

    const price_cents = eurosToCents(price);
    const stock_value =
      product.weight.unit === "gr"
        ? Math.round(Number(stock) * 1000)
        : Number(stock);

    const newStock = new Stock({
      product: product._id,
      shop: shop._id,
      price: price_cents,
      stockTotal: stock_value,
      description,
      tags: tags.map((t) => t._id),
      ...rest,
    });

    await newStock.save();

    // retourne tous les produits
    const newStocks = await Stock.find({ shop: shop._id })
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

    res.status(200).json({ success: true, stocks: newStocks });
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

    const { _id, product, stockTotal, price, description, tags, ...rest } =
      req.body;

    if (!price || !stockTotal) {
      return res.status(404).json({
        success: false,
        message: "Des informations sont manquantes. (prix, quantité)",
      });
    }

    const price_cents = eurosToCents(price);
    const stock_value =
      product.weight.unit === "gr"
        ? Math.round(Number(stockTotal) * 1000)
        : Number(stockTotal);

    await Stock.findOneAndUpdate(
      { _id },
      {
        product: product._id,
        shop: shop._id,
        price: price_cents,
        stockTotal: stock_value,
        description,
        tags: tags.map((t) => t._id),
        ...rest,
      },
      { new: true },
    );

    // retourne tous les produits
    const newStocks = await Stock.find({ shop: shop._id })
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

    res.status(200).json({ success: true, stocks: newStocks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: true, message: "Internal server error" });
    return;
  }
};

/* cette fonction n'est plus utilisée au profit de softDeleteStocks */
const deleteStocks = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await hasShop(req.auth.userId);
    if (!shop)
      return res
        .status(404)
        .json({ success: false, message: "No shop found." });

    const deletedStock = await Stock.findByIdAndDelete({ _id: id });
    if (!deletedStock)
      return res
        .status(404)
        .json({ success: false, message: "Stock not found." });

    const newStocks = await Stock.find({ shop: shop._id })
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

    res.status(200).json({ success: true, stocks: newStocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ succes: false, message: "Internal server error." });
  }
};

const softDeleteStocks = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await hasShop(req.auth.userId);
    if (!shop)
      return res
        .status(200)
        .json({ success: false, message: "No shop found." });

    const deletedStock = await Stock.findByIdAndUpdate(id, { isDeleted: true });
    if (!deletedStock) {
      return res.status(200).json({
        success: false,
        message: "Suppression impossible : produit non trouvé.",
      });
    }

    const newStocks = await Stock.find({ shop: shop._id, isDeleted: false })
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

    console.log(
      "NEWSTOCKS :",
      newStocks.map((s) => "isDeleted :" + s.isDeleted),
    );

    res.status(200).json({ success: true, stocks: newStocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ succes: false, message: "Internal server error." });
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
    const stocks = await Stock.find({ shop: shopId, isDeleted: false })
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
    console.log("stocks :", stocks);

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
  deleteStocks,
  softDeleteStocks,
  getStocksByShop,
};
