const { User, Producer, Shop, Order } = require("../models");

const { isShop } = require("../modules/verification");

/**
 * Permet de savoir s'il existe un user avec ce clerkUUID et si ce user a
 * un profil Producer et enfin si ce producer a un shop
 * @param {string} clerkUUID
 * @returns shop
 */
/*const isShop = async (clerkUUID) => {
  const user = await User.findOne({ clerkUUID });
  if (!user) {
    throw new Error("No user found.");
  }
  const producer = await Producer.findOne({ owner: user._id });
  if (!producer) {
    throw new Error("User has no producer profile.");
  }

  const shop = Shop.findOne({ producer: producer._id });
  if (!shop) {
    throw new Error("Shop not found.");
  }
  return shop;
};*/

const getAllOrders = async (req, res) => {
  try {
    const shop = await isShop(req.auth.userId);

    // console.log("shop: ", shop);

    const orders = await Order.find({
      details: { $elemMatch: { shop: shop._id } },
    })
      .sort({ createdAt: -1 })
      .populate("user", "lastname firstname")
      .populate("details.market")
      .populate("details.products.product");

    // console.log(orders);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
