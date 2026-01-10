const { Invoice, ShopInvoiceCounter } = require("../models");
const { buildInvoiceFromOrder } = require("../builders/invoiceBuilder.js");

async function createInvoiceForSubOrder({
  order,
  subOrder,
  confirmedProducts,
  session,
}) {
  try {
    // console.log("subOrder in createInvoice :", subOrder)
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
      confirmedProducts,
    });

    // Sauvegarde en base (source de vérité)
    // utilisation de [] à cause de la session dans le create
    const [invoice] = await Invoice.create([invoiceData], { session });

    if (!invoice) {
      throw new Error("Invoice creation returned empty result");
    }

    return invoice;
  } catch (error) {
    console.error("Invoice creation failed", {
      orderId: order._id,
      subOrderId: subOrder._id,
      originalError: error,
    });

    // 🔥 très important : on relance l’erreur
    throw new Error("Impossible de créer la facture");
  }
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
