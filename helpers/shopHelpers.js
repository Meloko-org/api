const { Shop, Producer, User, Stock } = require("../models");
const { hasShop } = require("../helpers/authHelpers");
const { convertDecimal } = require("../plugins/decimalNumberPlugin");

/* 	à utiliser à la fin d'une fonction controller pour retourner le shop 
		On peut choisir de retourner simplement le shop 
		ou le shop avec ses stocks
*/
const returnShop = async (shopId, withStocks = false) => {
  const shop = await Shop.findById(shopId)
    .populate({
      path: "notes",
      populate: {
        path: "user",
        model: "users",
      },
    })
    .populate({
      path: "types",
      model: "types",
    })
    .populate({
      path: "markets",
      populate: [
        {
          path: "market",
          model: "markets",
        },
      ],
    })
    .populate({
      path: "features",
      model: "shopfeatures",
    })
    .lean(); // <-- transforme direct en objet JS simple

  if (!shop) return null;

  if (withStocks) {
    const stocks = await Stock.find({ shop: shop._id })
      .populate({
        path: "product",
        populate: {
          path: "family",
          model: "productFamily",
        },
      })
      .populate("tags")
      .lean();

    shop.products = stocks;
  }

  return convertDecimal(shop);
};

module.exports = {
  returnShop,
};
