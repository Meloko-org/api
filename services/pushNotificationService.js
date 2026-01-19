const { Expo } = require("expo-server-sdk");
const { UserPushToken } = require("../models");
const { buildOrderNotification } = require("../builders/notifbuilder");

const expo = new Expo();

async function notifyClientOrderPrepared(order, subOrderId) {
  console.log("push service");
  const clientId = order.user; // ou order.client selon ton modèle
  console.log("clientId :", clientId);
  // 1️⃣ récupérer les tokens du client
  const tokens = await UserPushToken.find({ user: clientId });
  console.log("tokens :", tokens);
  if (!tokens.length) return;

  console.log("[PUSH] sending order prepared", {
    orderId: order._id,
    clientId: order.user,
    tokens: tokens.map((t) => t.token),
  });

  const subOrder = order.details.find(
    (detail) => detail._id.toString() === subOrderId,
  );

  const { title, body, type } = buildOrderNotification(subOrder);

  // 2️⃣ construire les messages
  const messages = tokens
    .map(({ token }) => {
      if (!Expo.isExpoPushToken(token)) return null;

      return {
        to: token,
        sound: "default",
        title,
        body,
        data: {
          type,
          orderId: order._id.toString(),
          debug: true,
        },
      };
    })
    .filter(Boolean);

  if (!messages.length) return;

  // 3️⃣ envoyer
  const response = await expo.sendPushNotificationsAsync(messages);

  console.log("[PUSH RESPONSE]", JSON.stringify(response, null, 2));

  // nettoyage des tokens invalides
  const invalidTokens = response
    .map((res, i) =>
      res.status === "error" && res.details?.error === "DeviceNotRegistered"
        ? messages[i].to
        : null,
    )
    .filter(Boolean);

  await UserPushToken.deleteMany({ token: { $in: invalidTokens } });
}

module.exports = {
  notifyClientOrderPrepared,
};
