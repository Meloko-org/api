const mongoose = require("mongoose");
const { Stock, Shop, User } = require("../models");
const validationModule = require("../modules/validation");

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

const updateStocks = async (req, res) => {
  try {
    const user = await User.find({ clerkUUID: req.auth.userId });
    if (!user) {
      throw new Error("user not found.");
    }

    const values = req.body;
    const shopId = values[0].shop;

    await Promise.all(
      values.map(async (stockdata) => {
        const { _id, price, stock, shop, product, tags } = stockdata;

        const updatedPrice = mongoose.Types.Decimal128.fromString(
          price.toString(),
        );
        const updatedStock = mongoose.Types.Decimal128.fromString(
          stock.toString(),
        );

        return Stock.findOneAndUpdate(
          { _id },
          { product, shop, price: updatedPrice, stock: updatedStock, tags },
          { upsert: true, new: true },
        );
      }),
    );

    const updatedStocks = await Stock.find({ shop: shopId }).populate({
      path: "product",
      populate: {
        path: "family",
        model: "productFamily",
        populate: { path: "category", model: "productcategory" },
      },
    });

    res.status(200).json(updatedStocks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
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

    console.log("stocks :", JSON.stringify(stocks, null, 2));

    res.status(200).json({ success: true, stocks });
  } catch (error) {
    console.error("Error fetching stocks:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};

module.exports = {
  updateStocks,
  getStocksByShop,
};
