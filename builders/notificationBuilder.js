function buildOrderNotification(subOrder) {
  if (subOrder.status === "prepared") {
    return {
      title: "Commande prête ✅",
      body: "Votre commande est validée.",
      type: "order-prepared",
    };
  }

  if (subOrder.status === "partially_prepared") {
    return {
      title: "Commande partiellement prête ⚠️",
      body: `Votre commande est validée.\nCertains produits sont annulés.`,
      type: "order-partially-prepared",
    };
  }

  if (subOrder.status === "cancelled") {
    return {
      title: "Commande annulée ❌",
      body: "Votre commande a été annulée.",
      type: "order-cancelled",
    };
  }

  return null;
}

module.exports = {
  buildOrderNotification,
};
