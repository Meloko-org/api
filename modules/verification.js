const { User, Producer, Shop } = require("../models");

const isUser = async (clerkUUID) => {
  const user = await User.findOne({ clerkUUID });
  if (!user) {
    throw new Error("User not found.");
  }
  return user;
};

const isProducer = async (clerkUUID) => {
  const user = await isUser(clerkUUID);
  if (user) {
    const producer = await Producer.findOne({ owner: user._id });
    if (!producer) {
      throw new Error("No producer found.");
    }
    return producer;
  }
};

const isShop = async (clerkUUID) => {
  const producer = await isProducer(clerkUUID);
  if (producer) {
    const shop = await Shop.findOne({ producer: producer._id });
    if (!shop) {
      throw new Error("Shop not found.");
    }
    return shop;
  }
};

module.exports = {
  isUser,
  isProducer,
  isShop,
};
