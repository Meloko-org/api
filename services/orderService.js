const { OrderCounter, Order } = require("../models");

const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  const counter = await OrderCounter.findOneAndUpdate(
    { year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  );

  const paddedSequence = counter.sequence.toString().padStart(6, "0");

  return `C-${year}-${paddedSequence}`;
};

const updateRefundedProduct = async (creditNote) => {
  try {
    if (!creditNote) throw new Error("no creditNote.");

    const order = await Order.findById(creditNote.order);
    if (!order) {
      throw new Error(`Order not found for creditNote ${creditNote._id}`);
    }

    const subOrder = order.details.find(
      (so) => so._id.toString() === creditNote.subOrder,
    );
    if (!subOrder) {
      throw new Error(`SubOrder not found for creditNote ${creditNote._id}`);
    }

    subOrder.products.forEach((p) => {
      const refundedLine = creditNote.lines.find(
        (l) => l.product.toString() === p.product.toString(),
      );

      if (!refundedLine) return;

      // protection double remboursement
      if (p.refunded) return;

      p.refunded = true;
      p.refundReason = creditNote.reason;
      p.refundedAt = creditNote.refundedAt;
      p.refundCreditNote = creditNote._id;
    });

    order.markModified("details"); // sécurité détection modification
    await order.save();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateOrderNumber,
  updateRefundedProduct,
};
