const { Invoice, ShopInvoiceCounter } = require("../models");
const { buildInvoiceFromOrder } = require("../builders/invoiceBuilder.js");

async function createInvoiceForSubOrder({ order, subOrder, session }) {
  const existingInvoice = await Invoice.findOne({
    order: order._id,
    shop: subOrder.shop,
  }).session(session);

  if (existingInvoice) {
    return existingInvoice;
  }
  // Génération du numéro légal
  const invoiceNumber = await generateShopInvoiceNumber(
    subOrder.shop._id,
    session,
  );

  // Construction des données métier
  const invoiceData = buildInvoiceFromOrder({
    order,
    subOrder,
    invoiceNumber,
  });

  // Sauvegarde en base (source de vérité)
  // utilisation de [] à cause de la session dans le create
  const [invoice] = await Invoice.create([invoiceData], { session });

  return invoice;
}

const generateShopInvoiceNumber = async (shopId, session) => {
  const year = new Date().getFullYear();

  const counter = await ShopInvoiceCounter.findOneAndUpdate(
    { shop: shopId, year },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true },
  ).session(session);

  const prefix = shopId.toString().slice(-5);

  const paddedSequence = counter.sequence.toString().padStart(6, "0");

  return `F-${prefix}-${year}-${paddedSequence}`;
};

module.exports = {
  createInvoiceForSubOrder,
  generateShopInvoiceNumber,
};
