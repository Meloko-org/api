const mongoose = require("mongoose");
const { Order, Stock } = require("../models");

/** RESERVER LE STOCK
 * Quand order.isPaid = true (payment_intent.succeeded).
 * Vérifie que le stock est suffisant.
 * Incrémente stockReserved.
 */
export const reserveStockForOrder = async (orderId) => {
  const session = await mongoose.startSession();

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
            throw new Error("Insufficient stock");
          }

          stock.stockReserved += product.quantity;
          await stock.save({ session });
        }
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
export const consumeStockForSubOrder = async (subOrder, session) => {
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

/** ANNULER UN PRODUIT AVANT VALIDATION
 * Quand le subOrder est "pending".
 * Quand un produit est annulé.
 * Libère la réservation.
 */
export const releaseReservedStockForSubOrder = async (subOrder, session) => {
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

/** ANNULER UN PRODUIT APRES VALIDATION
 * A la création d'une creditNote.
 * Réinjecte le stock.
 */
export const restoreStockFromCreditNote = async (creditNote) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      for (const line of creditNote.lines) {
        const stock = await Stock.findOne({
          product: line.product,
          shop: creditNote.shop,
        }).session(session);

        if (!stock) {
          throw new Error(
            `Stock not found for product ${line.product.toString()}`,
          );
        }

        stock.stockReserved = Math.max(0, stock.stockReserved - line.quantity);

        await stock.save({ session });
      }
    });
  } finally {
    session.endSession();
  }
};
