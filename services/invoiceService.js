const { Invoice, ShopInvoiceCounter } = require("../models");
const { buildInvoiceFromOrder } = require("../builders/invoiceBuilder.js");

async function createInvoiceForSubOrder({ order, subOrder }) {
  const existingInvoice = await Invoice.findOne({
    order: order._id,
    shop: subOrder.shop,
  });

  if (existingInvoice) {
    return existingInvoice;
  }
  // 1️⃣ Génération du numéro légal
  const invoiceNumber = await generateShopInvoiceNumber(subOrder.shop._id);

  // 2️⃣ Construction des données métier
  const invoiceData = buildInvoiceFromOrder({
    order,
    subOrder,
    invoiceNumber,
  });

  // 3️⃣ Sauvegarde en base (source de vérité)
  const invoice = await Invoice.create(invoiceData);

  return invoice;
}

const generateShopInvoiceNumber = async (shopId) => {
  const year = new Date().getFullYear();

  const counter = await ShopInvoiceCounter.findOneAndUpdate(
    { shop: shopId, year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  );

  const prefix = shopId.toString().slice(-5);

  const paddedSequence = counter.sequence.toString().padStart(6, "0");

  return `F-${prefix}-${year}-${paddedSequence}`;
};

module.exports = {
  createInvoiceForSubOrder,
  generateShopInvoiceNumber,
};
