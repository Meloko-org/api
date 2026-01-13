const {
  consumeStockForSubOrder,
  restoreStockFromCreditNote,
} = require("../stockService");
const { createInvoiceForSubOrder } = require("../invoiceService");
const { createCreditNoteFromSubOrder } = require("../creditNoteService");
const {
  computeShopAmounts,
  recomputeOrderTotals,
} = require("../../helpers/orderHelpers");
const { refundFromCreditNote } = require("../stripeService");

const handlePreparation = async ({
  order,
  subOrder,
  cancelledProductIds = [],
  session,
  postCommitActions,
}) => {
  console.log("executing handlePreparation");

  if (subOrder.status !== "pending") {
    throw new Error("Only pending subOrders can be prepared");
  }

  const cancellableProducts = subOrder.products.filter(
    (p) => cancelledProductIds.includes(p._id.toString()) && !p.refunded,
  );

  /* Mise à jour des statuts produits */
  subOrder.products.forEach((product) => {
    if (product.refunded) return; // on ne réécrit pas le status d'un produit déjà refunded

    if (cancellableProducts.includes(product)) {
      product.productStatus = "cancelled";
    } else {
      product.productStatus = "confirmed";
    }
  });

  const confirmedProducts = subOrder.products.filter(
    (p) => p.productStatus === "confirmed",
  );

  const cancelledProducts = subOrder.products.filter(
    (p) => p.productStatus === "cancelled",
  );

  /* Détermination du status du subOrder */
  subOrder.status =
    cancelledProducts.length === 0 ? "prepared" : "partially_prepared";

  const { shopTotalHT, shopTotalVAT, shopTotalTTC } =
    computeShopAmounts(confirmedProducts);

  subOrder.shopTotalHT = shopTotalHT;
  subOrder.shopTotalVAT = shopTotalVAT;
  subOrder.shopTotalTTC = shopTotalTTC;

  /* Stock */
  await consumeStockForSubOrder(subOrder, session);

  /* Facture du subOrder */
  const invoice = await createInvoiceForSubOrder({
    order,
    subOrder,
    confirmedProducts,
    session,
  });

  subOrder.invoice = invoice._id;

  /* Avoir du subOrder si nécessaire */
  if (cancelledProducts.length > 0) {
    const creditNote = await createCreditNoteFromSubOrder({
      order,
      subOrder,
      invoice,
      cancelledProducts,
      reason: "Annulation partielle de commande",
      session,
    });

    subOrder.creditNotes.push(creditNote._id);

    // Restauration du stock
    await restoreStockFromCreditNote({ creditNote, session });

    // mémoriser l'action stripe à effectuer après la session
    postCommitActions.refunds.push({
      creditNoteId: creditNote._id.toString(),
    });
  }

  /* Totaux */
  recomputeOrderTotals(order);
};

module.exports = {
  handlePreparation,
};
