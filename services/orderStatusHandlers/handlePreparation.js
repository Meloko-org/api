const {
  consumeStockForSubOrder,
  releaseReservedStockForSubOrder,
} = require("../stockService");
const { createInvoiceForSubOrder } = require("../invoiceService");
const { createCreditNoteFromSubOrder } = require("../creditNoteService");
const { recomputeOrderTotals } = require("../../helpers/orderHelpers");
const { refundFromCreditNote } = require("../stripeService");

export const handlePreparation = async ({
  order,
  subOrder,
  canceledProducts = [],
  session,
}) => {
  /* Mise à jour des statuts produits */
  subOrder.products.forEach((product) => {
    if (canceledProducts.includes(product._id.toString())) {
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

  if (cancelledProducts.length > 0) {
    await releaseReservedStockForSubOrder(subOrder, session);
  }

  /* Facture du subOrder */
  const invoice = await createInvoiceForSubOrder({
    order,
    subOrder,
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

    await refundFromCreditNote(creditNote._id);
  }

  /* Totaux */
  recomputeOrderTotals(order);
};
