const { Shop, User, Producer } = require("../models");
const CustomError = require("./CustomError");

const isProducerUser = async (clerkUUID) => {
  const user = await User.findOne({ clerkUUID });
  if (!user) throw new CustomError("No user found", 404);

  const producer = await Producer.findOne({ owner: user._id });
  if (!producer) throw new CustomError("User has no producer profile", 403);

  return producer;
};

const hasShop = async (clerkUUID) => {
  const producer = await isProducerUser(clerkUUID);
  const shop = await Shop.findOne({ producer: producer._id });

  if (!shop) throw new CustomError("No shop found", 404);

  return shop;
};

module.exports = {
  isProducerUser,
  hasShop,
};
