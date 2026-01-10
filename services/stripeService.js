const { CreditNote, Order } = require("../models");
const {
  getRefundAmountFromCreditNote,
} = require("../helpers/creditNoteHelpers");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const refundFromCreditNote = async (creditNoteId) => {
  console.log("executing refundFromCreditNote");
  const creditNote = await CreditNote.findById(creditNoteId);
  if (!creditNote) throw new Error("CreditNote not found");

  // 🛑 idempotence
  if (creditNote.stripeRefundId) {
    return creditNote;
  }

  const order = await Order.findById(creditNote.order);
  // sécurités
  if (!order.isPaid) {
    throw new Error("Order is not paid");
  }

  if (!order.paymentIntentId) {
    throw new Error("No paymentIntent on order");
  }

  const amount = getRefundAmountFromCreditNote(creditNote);

  if (amount <= 0) {
    throw new Error("Refund amount must be > 0");
  }

  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
    amount,
    metadata: {
      creditNoteId: creditNote._id.toString(),
      orderId: creditNote.order.toString(),
      subOrderId: creditNote.subOrder.toString(),
      reason: "requested_by_customer",
    },
  });

  creditNote.stripeRefundId = refund.id;
  creditNote.refundedAt = new Date();
  await creditNote.save();

  console.log("refundFromCreditNote done!!");

  return creditNote;
};

module.exports = {
  refundFromCreditNote,
};
