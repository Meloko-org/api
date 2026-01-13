const { CreditNoteCounter, CreditNote } = require("../models");
const {
  buildCreditNoteFromSubOrder,
} = require("../builders/creditNoteBuilder");

async function createCreditNoteFromSubOrder({
  order,
  subOrder,
  invoice = null,
  cancelledProducts,
  reason,
  session,
}) {
  try {
    const creditNoteNumber = await generateCreditNoteNumber(
      subOrder.shop._id,
      session,
    );

    const creditNoteData = buildCreditNoteFromSubOrder({
      order,
      subOrder,
      invoice,
      cancelledProducts,
      creditNoteNumber,
      reason,
    });

    const [creditNote] = await CreditNote.create([creditNoteData], { session });

    if (!creditNote) {
      throw new Error("CreditNote creation returned empty result");
    }

    return creditNote;
  } catch (error) {
    console.error("CreditNote creation failed", {
      orderId: order._id,
      subOrderId: subOrder._id,
      originalError: error,
    });

    throw new Error("Impossible de créer l'avoir.");
  }
}

const generateCreditNoteNumber = async (shopId, session) => {
  const year = new Date().getFullYear();

  const counter = await CreditNoteCounter.findOneAndUpdate(
    { shop: shopId, year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  ).session(session);

  const prefix = shopId.toString().slice(-5);

  const paddedSequence = counter.sequence.toString().padStart(6, "0");

  return `A-${prefix}-${year}-${paddedSequence}`;
};

module.exports = {
  createCreditNoteFromSubOrder,
  generateCreditNoteNumber,
};
