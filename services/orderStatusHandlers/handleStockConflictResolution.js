const { restoreStockFromCreditNote } = require("../stockService");
const { createInvoiceForSubOrder } = require("../invoiceService");
const { createCreditNoteFromSubOrder } = require("../creditNoteService");
const {
  computeShopAmounts,
  recomputeOrderTotals,
} = require("../../helpers/orderHelpers");

const handleStockConflictResolution = async ({
  order,
  subOrder,
  cancelledProductIds = [],
  session,
  postCommitActions,
}) => {
  console.log("handleStockConflictResolution running ---------------->");
  if (!subOrder.stockIssue) {
    throw new Error("No stock issue to resolve");
  }

  const isFullCancellation = cancelledProductIds.length === 0;

  // Mise à jour des produits
  subOrder.products.forEach((p) => {
    if (isFullCancellation || cancelledProductIds.includes(p._id.toString())) {
      p.productStatus = "cancelled";
    }
  });

  const cancelledProducts = subOrder.products.filter(
    (p) => p.productStatus === "cancelled",
  );

  const confirmedProducts = subOrder.products.filter(
    (p) => p.productStatus === "confirmed",
  );

  // Statut du subOrder
  subOrder.status = isFullCancellation ? "cancelled" : "partially_prepared";

  // Totaux shop
  const { shopTotalHT, shopTotalVAT, shopTotalTTC } =
    computeShopAmounts(confirmedProducts);

  subOrder.shopTotalHT = shopTotalHT;
  subOrder.shopTotalVAT = shopTotalVAT;
  subOrder.shopTotalTTC = shopTotalTTC;

  // Facture (si pas déjà créée)
  const invoice = await createInvoiceForSubOrder({
    order,
    subOrder,
    confirmedProducts,
    session,
  });

  // Avoir
  const creditNote = await createCreditNoteFromSubOrder({
    order,
    subOrder,
    invoice,
    cancelledProducts,
    reason: "Produit hors stock",
    session,
  });

  subOrder.creditNotes.push(creditNote._id);

  // Restauration du stock
  await restoreStockFromCreditNote({ creditNote, session });

  // Refund Stripe
  // mémoriser l'action stripe à effectuer après la session
  postCommitActions.refunds.push({
    creditNoteId: creditNote._id.toString(),
  });

  // Nettoyage
  subOrder.stockIssue = false;

  // Totaux commande
  recomputeOrderTotals(order);
};

module.exports = {
  handleStockConflictResolution,
};
