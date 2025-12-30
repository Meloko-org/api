import { createCreditNoteFromSubOrder } from "../creditNoteService";
import { refundFromCreditNote } from "../stripeService";

const { Order } = require("../../models");
const { releaseReservedStockForSubOrder } = require("../stockService");
const { recomputeOrderTotals } = require("../../helpers/orderHelpers");

export const handleCancellation = async ({ order, subOrder, session }) => {
  // Sécurité : état autorisé
  if (subOrder.status !== "pending") {
    throw new Error("Only pending subOrders can be cancelled");
  }

  // Tous les produits annulés
  subOrder.products.forEach((product) => {
    product.productStatus = "cancelled";
  });

  // Totaux shop à zéro
  subOrder.shopTotalHT = 0;
  subOrder.shopTotalVAT = 0;
  subOrder.shopTotalTTC = 0;

  // Statut
  subOrder.status = "cancelled";

  // Stock : libération des réservations
  await releaseReservedStockForSubOrder(subOrder, session);

  const creditNote = await createCreditNoteFromSubOrder({
    order,
    subOrder,
    cancelledProducts: subOrder.products,
    reason: "Annulation totale de commande",
    session,
  });

  subOrder.creditNotes.push(creditNote._id);

  await refundFromCreditNote(creditNote._id);

  // Totaux commande
  recomputeOrderTotals(order);
};
