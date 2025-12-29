const { CreditNoteCounter, CreditNote } = require("../models");
const {
  buildCreditNoteFromSubOrder,
} = require("../builders/creditNoteBuilder");

async function createCreditNoteFromSubOrder({
  order,
  subOrder,
  invoice,
  reason,
}) {
  const existing = await CreditNote.findOne({
    invoice: invoice._id,
    shop: subOrder.shop,
  });

  if (existing) return existing;

  const creditNoteNumber = await generateCreditNoteNumber(subOrder.shop._id);

  const creditNoteData = buildCreditNoteFromSubOrder({
    order,
    subOrder,
    invoice,
    creditNoteNumber,
    reason,
  });

  const creditNote = await CreditNote.create(creditNoteData);

  return creditNote;
}

const generateCreditNoteNumber = async (shopId) => {
  const year = new Date().getFullYear();

  const counter = await CreditNoteCounter.findOneAndUpdate(
    { shop: shopId, year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  );

  const prefix = shopId.toString().slice(-5);

  const paddedSequence = counter.sequence.toString().padStart(6, "0");

  return `A-${prefix}-${year}-${paddedSequence}`;
};

module.exports = {
  createCreditNoteFromSubOrder,
  generateCreditNoteNumber,
};
