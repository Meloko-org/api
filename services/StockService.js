const mongoose = require("mongoose");
const { Order, Stock } = require("../models");

/** RESERVER LE STOCK
 * Quand order.isPaid = true (payment_intent.succeeded).
 * Vérifie que le stock est suffisant.
 * Incrémente stockReserved.
 */
const reserveStockForOrder = async (orderId) => {
  const session = await mongoose.startSession();

  const stockIssues = [];

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);

      if (!order) throw new Error("Order not found");

      for (const subOrder of order.details) {
        for (const product of subOrder.products) {
          const stock = await Stock.findById(product.product).session(session);

          if (!stock) throw new Error("Stock not found");

          const available = stock.stockTotal - stock.stockReserved;

          if (available < product.quantity) {
            stockIssues.push({
              subOrderId: subOrder._id.toString(),
              productId: product.product.toString(),
            });
            continue;
          }

          stock.stockReserved += product.quantity;
          await stock.save({ session });
        }
      }

      if (stockIssues.length > 0) {
        throw new Error(
          JSON.stringify({
            code: "INSUFFICIENT_STOCK",
            stockIssues,
          }),
        );
      }
    });
  } finally {
    session.endSession();
  }
};

/** VALIDER UN SUBORDER
 * Quand le status du subOrder passe à "prepared"
 * Décrémente le stock total.
 * Décrémente le stock réservé.
 */
const consumeStockForSubOrder = async (subOrder, session) => {
  for (const product of subOrder.products) {
    if (product.productStatus !== "confirmed") continue;

    const stock = await Stock.findById(product.product).session(session);
    stock.stockTotal -= product.quantity;
    stock.stockReserved -= product.quantity;

    if (stock.stockTotal < 0 || stock.stockReserved < 0) {
      throw new Error("Invalid stock state");
    }

    await stock.save({ session });
  }
};

// n'est plus utilisée
/** ANNULER TOUS LES PRODUITS D'UNE COMMANDE AVANT VALIDATION
 * Quand le subOrder est "pending".
 * Libère la réservation.
 */
const releaseReservedStockForSubOrder = async (subOrder, session) => {
  for (const product of subOrder.products) {
    if (product.productStatus !== "cancelled") continue;

    const stock = await Stock.findById(product.product).session(session);
    if (!stock) {
      throw new Error("Stock not found");
    }

    stock.stockReserved -= product.quantity;

    if (stock.stockReserved < 0) {
      throw new Error("Invalid stockReserved");
    }

    await stock.save({ session });
  }
};

/** ANNULATION D'UN PRODUIT, DE PLUSIEURS PRODUITS OU DE TOUS LES PRODUITS
 * Après la création d'une creditNote.
 * Réinjecte le stock.
 */
const restoreStockFromCreditNote = async ({ creditNote, session }) => {
  for (const line of creditNote.lines) {
    console.log("STOCKSERVICE restore product:", line.product._id);
    console.log("STOCKSERVICE restore shop:", creditNote.shop);
    const stock = await Stock.findOne({
      product: line.product.product,
      shop: creditNote.shop,
    }).session(session);

    if (!stock) {
      throw new Error(`Stock not found for product ${line.product.toString()}`);
    }

    stock.stockReserved = Math.max(0, stock.stockReserved - line.quantity);

    await stock.save({ session });
  }
};

module.exports = {
  reserveStockForOrder,
  consumeStockForSubOrder,
  releaseReservedStockForSubOrder,
  restoreStockFromCreditNote,
};
