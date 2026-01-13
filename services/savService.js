const { createCreditNoteFromSubOrder } = require("./creditNoteService");
const {
  computeShopAmounts,
  recomputeOrderTotals,
} = require("../helpers/orderHelpers");

async function createRefund(
  order,
  subOrderId,
  scope,
  products,
  reason,
  session,
) {
  let refundableProducts = [];

  if (!order) throw new Error("No order for refund.");
  console.log("SAV SERVICE order :", order);

  const subOrder = order.details.find((so) => so._id.toString() === subOrderId);
  if (!subOrder) throw new Error("No suborder found.");

  // cas du remboursement de commande
  if (scope === "order") {
    refundableProducts = subOrder.products.filter(
      (p) => p.productStatus === "confirmed" && !p.refunded,
    );
  }

  // cas du remboursement d'un produit
  if (scope === "product") {
    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("No products provided for product refund.");
    }

    refundableProducts = subOrder.products.filter(
      (p) =>
        products.includes(p._id.toString()) &&
        p.productStatus === "confirmed" &&
        !p.refunded,
    );
  }

  if (refundableProducts.length === 0) {
    throw new Error("No refundable products found.");
  }

  console.log("SAv SERVICE refundableProducts :", refundableProducts);

  const creditNote = await createCreditNoteFromSubOrder({
    order,
    subOrder,
    cancelledProducts: refundableProducts,
    reason,
    session,
  });

  // 🔹 Mise à jour des produits
  refundableProducts.forEach((p) => {
    p.productStatus = "cancelled";
  });

  // 🔹 Mise à jour des totaux du subOrder
  const remainingProducts = subOrder.products.filter(
    (p) => p.productStatus === "confirmed",
  );

  const { shopTotalHT, shopTotalVAT, shopTotalTTC } =
    computeShopAmounts(remainingProducts);

  subOrder.shopTotalHT = shopTotalHT;
  subOrder.shopTotalVAT = shopTotalVAT;
  subOrder.shopTotalTTC = shopTotalTTC;

  if (remainingProducts.length === 0) {
    subOrder.status = "cancelled";
  }

  subOrder.creditNotes.push(creditNote._id);

  recomputeOrderTotals(order);

  await order.save({ session });

  return { creditNote };
}

module.exports = {
  createRefund,
};
