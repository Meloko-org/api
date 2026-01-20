const { Expo } = require("expo-server-sdk");
const { UserPushToken, Shop, Producer, User } = require("../models");
const { buildOrderNotification } = require("../builders/notificationbuilder");

const expo = new Expo();

async function notifyClientOrderPrepared(order, subOrderId) {
  const clientId = order.user;

  const tokens = await UserPushToken.find({ user: clientId });
  if (!tokens.length) return;

  const subOrder = order.details.find(
    (detail) => detail._id.toString() === subOrderId,
  );

  const { title, body, type } = buildOrderNotification(subOrder);

  await sendExpoPush({
    tokens,
    title,
    body,
    data: {
      type,
      orderId: order._id.toString(),
      debug: true,
    },
  });
}

async function notifyProducerOrderDone(order) {
  const shopIds = [...new Set(order.details.map((so) => so.shop.toString()))];

  for (const shopId of shopIds) {
    try {
      const shop = await Shop.findById(shopId);
      if (!shop) continue;

      const producer = await Producer.findById(shop.producer);
      if (!producer) continue;

      const user = await User.findById(producer.owner);
      if (!user) continue;

      const tokens = await UserPushToken.find({ user: user._id });
      if (!tokens.length) continue;

      await sendExpoPush({
        tokens,
        title: "Nouvelle commande",
        body: "Une nouvelle commande vient d'être passée.",
        data: {
          type: "producer-order",
          OrderId: order._id.toString(),
          shopId,
        },
      });
    } catch (error) {
      console.error(`Erreur notif producer pour shop ${shopId} :`, error);
    }
  }
}

async function sendExpoPush({ tokens, title, body, data = {} }) {
  const messages = tokens
    .filter((t) => Expo.isExpoPushToken(t))
    .map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data,
    }));

  if (!messages.length) return;

  const response = await expo.sendPushNotificationsAsync(messages);

  const invalidTokens = response
    .map((res, i) =>
      res.status === "error" && res.details?.error === "DeviceNotRegistered"
        ? messages[i].to
        : null,
    )
    .filter(Boolean);

  if (invalidTokens.length) {
    await UserPushToken.deleteMany({
      token: { $in: invalidTokens },
    });
  }
  return response;
}

module.exports = {
  notifyClientOrderPrepared,
  notifyProducerOrderDone,
};
