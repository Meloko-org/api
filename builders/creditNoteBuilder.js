const { computeTotalsFromHT } = require("../helpers/orderHelpers");

function buildCreditNoteFromSubOrder({
  order,
  subOrder,
  invoice,
  cancelledProducts,
  creditNoteNumber,
  reason,
}) {
  if (!cancelledProducts?.length) {
    throw new Error("Cannot build CreditNote with no cancelled products");
  }

  console.log("CREDITNOTE BUILDER order :", order);
  console.log("BUILDER: cancelledProducts :", cancelledProducts);

  const lines = cancelledProducts.map(buildCreditNoteLine);

  const totalHT = lines.reduce((sum, l) => sum + l.totalHT, 0);
  const totalVAT = lines.reduce((sum, l) => sum + l.totalVAT, 0);
  const totalTTC = lines.reduce((sum, l) => sum + l.totalTTC, 0);

  return {
    shop: subOrder.shop._id,
    order: order._id,
    subOrder: subOrder._id,
    creditNoteNumber: creditNoteNumber,
    issuedAt: new Date(),
    invoice: invoice ? invoice._id : null,
    reason: reason,
    customer: {
      name: `${order.user.firstname} ${order.user.lastname}`,
      email: order.user.email,
      address: order.billingAddress,
    },
    seller: {
      name: subOrder.shop.name,
      address: subOrder.shop.address,
      vatNumber: subOrder.shop.siret,
    },
    lines,
    totalHT,
    totalVAT,
    totalTTC,
  };
}

const buildCreditNoteLine = (cancelledProduct) => {
  const { quantity, unitPriceHT, totalPriceTTC } = cancelledProduct;
  const vatRate = cancelledProduct.product.product.vatRate;
  const unit = cancelledProduct.product.product.weight.unit;

  const { totalHT, totalVAT } = computeTotalsFromHT(cancelledProduct);

  console.log("BUILDER LINE product :", cancelledProduct);

  return {
    product: cancelledProduct.product,
    label: getCreditNoteProductName(cancelledProduct.product),
    quantity,
    unit,
    unitPriceHT,
    vatRate,
    totalHT,
    totalVAT,
    totalTTC: totalPriceTTC,
  };
};

function getCreditNoteProductName(stock) {
  if (stock.productCustomName?.trim()) {
    return stock.productCustomName;
  }

  const familyName = stock.product.family.name ?? "";
  const productName = stock.product.name ?? "";

  return `${familyName} ${productName}`.trim();
}

const buildCreditNotePdfData = (creditNote) => {
  const customer = creditNote.customer;
  const seller = creditNote.seller;

  return {
    creditNoteNumber: creditNote.creditNoteNumber,
    issuedAt: creditNote.issuedAt,

    invoiceNumber: creditNote.invoice?.invoiceNumber ?? null,
    invoiceIssuedAt: creditNote.invoice?.issuedAt ?? null,

    seller: {
      name: seller.name,
      vatNumber: seller.siret,
      address: {
        address1: seller.address.address1,
        address2: seller.address.address2,
        postalCode: seller.address.postalCode,
        city: seller.address.city,
        country: seller.address.country,
      },
    },

    customer: {
      name: customer.name,
      email: customer.email,
      address: {
        address1: customer.address.address1,
        address2: customer.address.address2,
        postalCode: customer.address.postalCode,
        city: customer.address.city,
        country: customer.address.country,
      },
    },

    lines: creditNote.lines.map((line) => ({
      label: line.label,
      quantity: line.quantity,
      unit: line.unit,
      unitPriceHT: line.unitPriceHT,
      vatRate: line.vatRate,
      totalHT: line.totalHT,
      totalVAT: line.totalVAT,
      totalTTC: line.totalTTC,
    })),

    totals: {
      totalHT: creditNote.totalHT,
      totalVAT: creditNote.totalVAT,
      totalTTC: creditNote.totalTTC,
    },

    reason: creditNote.reason,
    status: creditNote.status,
    stripeRefundId: creditNote.stripeRefundId ?? null,
  };
};

module.exports = {
  buildCreditNoteFromSubOrder,
  buildCreditNotePdfData,
};
