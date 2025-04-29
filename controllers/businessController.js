const { User, Producer, Shop, Order } = require("../models");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");
const { isShop } = require("../modules/verification");

const getAllOrders = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    // console.log(shop)

    // on récupère toutes les commandes qui concernent le shop
    let orders = await Order.find({
      details: { $elemMatch: { shop: shop._id } },
    })
      .sort({ createdAt: -1 })
      .populate("user", "lastname firstname")
      .populate("details.market")
      .populate("details.products.product");
    // .populate("details.shop")

    // on filtre les détails de la commandes pour ne conserver que celles
    // qui concernent le shop
    orders = orders.map((order) => ({
      ...order.toObject(),
      details: order.details.filter(
        (detail) =>
          detail.shop && detail.shop._id.toString() === shop._id.toString(),
      ),
    }));

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Erreur dans getAllOrders :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLastThreeOrders = async (req, res) => {
  try {
    const shop = await isShop(req.auth.userId);

    // console.log("shop: ", shop);

    const orders = await Order.find({
      details: { $elemMatch: { shop: shop._id } },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("user", "lastname firstname")
      .populate("details.market")
      .populate("details.products.product");

    // console.log(orders);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  getLastThreeOrders,
};
