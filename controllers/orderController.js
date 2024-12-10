const mongoose = require("mongoose");
const { Order } = require("../models");
const { validationModule } = require("../modules");
const { isShop } = require("../modules/verification");

const getOrderDetailsById = async (req, res) => {
  try {
    if (!req.params.id) {
      throw new Error("Order id missing.");
    }

    // récupération du shopId
    const shop = await isShop(req.auth.userId);

    const order = await Order.findById(req.params.id)
      .populate("user", "firstname lastname email")
      .populate({
        path: "details",
        populate: [
          {
            path: "products.product",
            model: "stocks",
            match: { shop: { $eq: shop._id } },
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
          // {
          // 	path: "shop",
          // 	model: "shops",
          // 	select: "name"
          // }
        ],
      });
    // console.log(order);
    res.status(200).json(order);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrderDetailsById,
};
