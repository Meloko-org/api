const { createCreditNoteFromSubOrder } = require("../creditNoteService");
const { refundFromCreditNote } = require("../stripeService");

const { Order } = require("../../models");
const { restoreStockFromCreditNote } = require("../stockService");
const { recomputeOrderTotals } = require("../../helpers/orderHelpers");

const handleCancellation = async ({
  order,
  subOrder,
  session,
  postCommitActions,
}) => {
  console.log("executing handleCancellation");
  // Sécurité : état autorisé
  if (subOrder.status !== "pending") {
    throw new Error("Only pending subOrders can be cancelled");
  }

  const cancellableProducts = subOrder.products.filter(
    (p) => p.productStatus === "confirmed" && !p.refunded,
  );

  if (cancellableProducts.length === 0) {
    throw new Error("No products to cancel.");
  }

  // Tous les produits annulés
  subOrder.products.forEach((product) => {
    if (product.productStatus === "confirmed" && !product.refunded) {
      product.productStatus = "cancelled";
    }
  });

  // Totaux shop à zéro
  subOrder.shopTotalHT = 0;
  subOrder.shopTotalVAT = 0;
  subOrder.shopTotalTTC = 0;

  // Statut
  subOrder.status = "cancelled";

  const creditNote = await createCreditNoteFromSubOrder({
    order,
    subOrder,
    cancelledProducts: cancellableProducts,
    reason: "Annulation totale de commande",
    session,
  });

  subOrder.creditNotes.push(creditNote._id);

  // Stock : libération des réservations
  await restoreStockFromCreditNote({ creditNote, session });

  // mémoriser l'action stripe à effectuer après la session
  postCommitActions.refunds.push({
    creditNoteId: creditNote._id.toString(),
  });

  // Totaux commande
  recomputeOrderTotals(order);
};

module.exports = {
  handleCancellation,
};
