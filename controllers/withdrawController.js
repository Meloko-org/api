const { User, Producer, Shop, Order } = require("../models");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");
const { isShop } = require("../modules/verification");
const { returnShop } = require("../helpers/shopHelpers");

const activate = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const { mode, value } = req.body;
    let modeLabel;

    if (mode === "clickCollect") {
      shop.clickCollect.isActive = value;
      modeLabel = "Click&Collect";
    } else if (mode === "markets") {
      if (value === false) {
        // mémorisation de l'état initial de l'activation des markets
        shop.marketsPreviouslyActive = shop.markets
          .filter((m) => m.isActive)
          .map((m) => m._id);

        shop.markets.forEach((m) => (m.isActive = false));
      } else {
        shop.markets.forEach((m) => {
          if (shop.marketsPreviouslyActive.includes(m._id)) {
            m.isActive = true;
          }
        });
        shop.marketsPreviouslyActive = [];
      }

      modeLabel = "Points de vente";
    }

    await shop.save();

    const returnedShop = await returnShop(shop._id, false);

    console.log("returned :", returnedShop);

    res
      .status(200)
      .json({
        success: true,
        shop: returnedShop,
        message: `Le mode ${modeLabel} est ${value ? "activé" : "désactivé"}.`,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  activate,
};
