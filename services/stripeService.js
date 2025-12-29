const { CreditNote, Order } = require("../models");
const {
  getRefundAmountFromCreditNote,
} = require("../helpers/creditNoteHelpers");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const refundFromCreditNote = async (creditNoteId) => {
  const creditNote = await CreditNote.findById(creditNoteId);
  if (!creditNote) throw new Error("CreditNote not found");

  // 🛑 idempotence
  if (creditNote.stripeRefundId) {
    return creditNote;
  }

  const order = await Order.findById(creditNote.order);
  if (!order?.paymentIntentId) {
    throw new Error("No paymentIntent on order");
  }

  const amount = getRefundAmountFromCreditNote(creditNote);

  if (amount <= 0) {
    throw new Error("Refund amount must be > 0");
  }

  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
    amount,
    reason: "requested_by_customer",
    metadata: {
      creditNoteId: creditNote._id.toString(),
      orderId: creditNote.order.toString(),
      subOrderId: creditNote.subOrderId.toString(),
    },
  });

  creditNote.stripeRefundId = refund.id;
  creditNote.refundedAt = new Date();
  await creditNote.save();

  return creditNote;
};
