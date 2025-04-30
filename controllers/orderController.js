const mongoose = require("mongoose");
const { Order } = require("../models");
const { validationModule } = require("../modules");
const { isShop, isUser } = require("../modules/verification");
const { isProducerUser, hasShop } = require("../helpers/authHelpers");

const getOrdersByUser = async (req, res) => {
  try {
    if (!req.params.id) {
      throw new Error("User id missing.");
    }

    const user = await isUser(req.auth.userId);

    if (!user) {
      throw new Error("No user found.");
    }

    const orders = await Order.find({ user: user._id })
      .populate("user", "firstname lastname email")
      .populate({
        path: "details",
        populate: [
          {
            path: "products.product",
            model: "stocks",
            select: "-createdAt -updatedAt",
            populate: {
              path: "product",
              model: "products",
              select: "name image weight family",
              populate: {
                path: "family",
                model: "productFamily",
                select: "name",
              },
            },
          },
          {
            path: "shop",
            model: "shops",
            select: "name notes address",
            populate: [
              {
                path: "notes",
                model: "notes",
              },
              {
                path: "markets.market",
                model: "markets",
                select: "name address",
              },
            ],
          },
        ],
      });

    // console.log(JSON.stringify(orders, null, 2));

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getOrderDetailsById = async (req, res) => {
  try {
    if (!req.params.id) {
      throw new Error("Order id missing.");
    }

    // récupération du shopId
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      "details.shop": shop._id,
    })
      .populate("user", "firstname lastname email")
      .populate({
        path: "details",
        populate: [
          {
            path: "products.product",
            model: "stocks",
            select: "-createdAt -updatedAt",
            populate: [
              {
                path: "product",
                model: "products",
                select: "name image weight family",
                populate: {
                  path: "family",
                  model: "productFamily",
                  select: "name",
                },
              },
              {
                path: "tags",
                model: "tags",
                select: "name",
              },
            ],
          },
        ],
      });
    console.log(order);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ succes: false, message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    if (!req.params.id) {
      throw new Error("Order id missing.");
    }

    // vérification du shop
    const shop = await isShop(req.auth.userId);
    if (!shop) {
      throw new Error("Shop not found.");
    }

    const orderId = req.params.id;
    const { order, status } = req.body;

    console.log("orderId :", orderId);
    console.log("order: ", order);

    const updatedOrder = await Order.findByIdAndUpdate(orderId, order, {
      new: true,
    });

    if (!updatedOrder) {
      throw new Error("Impossible de mettre à jour la commande.");
    }

    const message = getMessage(status);

    res.status(200).json({ result: true, message });
  } catch (error) {
    console.log(error);
    res.status(500).json({ result: false, message: error.message });
  }
};

const getMessage = (expr) => {
  let message = "";
  switch (expr) {
    case "validated":
      message = "Commande Validée";
      break;
    case "canceled":
      message = "Commande Annulée";
      break;
    case "pending":
      message = "Commande en attente";
      break;
    case "withdrawn":
      message = "Commande retirée";
      break;

    default:
      break;
  }
  return message;
};

module.exports = {
  getOrderDetailsById,
  updateOrder,
  getOrdersByUser,
};
