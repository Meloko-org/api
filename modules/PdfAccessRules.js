const { Shop, Order, Producer, User } = require("../models");

const invoiceAccessRules = [
  async ({ userId, invoice }) => {
    const user = await User.findOne({ clerkUUID: userId });
    if (!user) return false;
    const producer = await Producer.findOne({ owner: user._id });
    if (!producer) return false;
    return Shop.exists({ producer: producer, _id: invoice.shop });
  },

  async ({ userId, invoice }) => {
    const user = await User.findOne({ clerkUUID: userId });
    if (!user) return false;
    return Order.exists({ _id: invoice.order, user: user._id });
  },
];

async function canAccessInvoice(ctx) {
  for (const rule of invoiceAccessRules) {
    if (await rule(ctx)) return true;
  }
  return false;
}

const creditNoteAccessRules = [
  async ({ userId, creditNote }) => {
    const user = await User.findOne({ clerkUUID: userId });
    if (!user) return false;
    const producer = await Producer.findOne({ owner: user._id });
    if (!producer) return false;
    return Shop.exists({ producer: producer, _id: creditNote.shop });
  },

  async ({ userId, creditNote }) => {
    const user = await User.findOne({ clerkUUID: userId });
    if (!user) return false;
    return Order.exists({ _id: creditNote.order, user: user._id });
  },
];

async function canAccessCreditNote(ctx) {
  for (const rule of creditNoteAccessRules) {
    if (await rule(ctx)) return true;
  }
  return false;
}

module.exports = {
  canAccessInvoice,
  canAccessCreditNote,
};
