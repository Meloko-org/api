const { User, Producer, Shop, Order } = require("../models");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");
const { isShop } = require("../modules/verification");

/**
 * cette fonction retourne uniquement les données utiles pour chaque commande
 * {
  "_id": "abc123",
  "createdAt": "2025-04-24T07:57:05.877Z",
  "user": {
    "firstname": "Jean",
    "lastname": "Dupont"
  },
  "detail": {
    "status": "pending",
    "shopTotalPrice": "18.90"
  }
}
 */
const getOrderSummary = async (req, res) => {
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
      .populate("user", "lastname firstname");

    // on conserve le detail qui concerne le shop et on retourne
    // uniquement les données utiles
    const filteredOrders = orders.map((order) => {
      const detail = order.details.find(
        (d) => d.shop && d.shop._id.toString() === shop._id.toString(),
      );
      return {
        _id: order._id,
        createdAt: order.createdAt,
        user: order.user,
        detail: {
          status: detail?.status,
          shopTotalTTC: detail?.shopTotalTTC,
          shopTotalHT: detail?.shopTotalHT,
          shopTotalVAT: detail?.shopTotalVAT,
        },
      };
    });

    console.log("orders :", JSON.stringify(filteredOrders, null, 2));

    res.status(200).json({ success: true, orders: filteredOrders });
  } catch (error) {
    console.error("Erreur dans getAllOrders :", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ success: false, message: "Shop not found." });
    }

    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      details: {
        $elemMatch: {
          shop: shop._id,
          status: type,
        },
      },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "firstname lastname");

    const filteredOrders = orders.map((order) => ({
      ...order.toObject(),
      details: order.details.filter(
        (detail) =>
          detail.shop?.toString() === shop._id.toString() &&
          detail.status === type,
      ),
    }));

    const totalOrders = await Order.countDocuments({
      details: {
        $elemMatch: {
          shop: shop._id,
          status: type,
        },
      },
    });

    console.log(filteredOrders);

    res.status(200).json({
      success: true,
      orders: filteredOrders,
      total: totalOrders,
      page,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
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
  getOrderSummary,
  getOrders,
  getLastThreeOrders,
};
