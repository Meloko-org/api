const { computeTotalsFromHT } = require("../helpers/orderHelpers");

function buildCreditNoteFromSubOrder({
  subOrder,
  invoice,
  creditNoteNumber,
  reason,
}) {
  const canceledProducts = subOrder.products.filter(
    (p) => p.productStatus === "cancelled",
  );

  const lines = canceledProducts.map(buildCreditNoteLine);

  const totalHT = lines.reduce((sum, l) => sum + l.totalHT, 0);
  const totalVAT = lines.reduce((sum, l) => sum + l.totalVAT, 0);
  const totalTTC = lines.reduce((sum, l) => sum + l.totalTTC, 0);

  return {
    creditNoteNumber: creditNoteNumber,
    invoice: invoice._id,
    shop: subOrder.shop._id,
    issuedAt: new Date(),
    reason: reason,
    lines,
    totalHT,
    totalVAT,
    totalTTC,
  };
}

const buildCreditNoteLine = (cancelledProduct) => {
  const { quantity, unitPriceHT, totalPriceTTC } = cancelledProduct;
  const vatRate = cancelledProduct.product.product.vatRate;

  const { totalHT, totalVAT } = computeTotalsFromHT(cancelledProduct);

  return {
    product: cancelledProduct.product,
    label: getCreditNoteProductName(cancelledProduct.product),
    quantity,
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
  return {
    shop: creditNote.shop,
    creditNoteNumber: creditNote.creditNoteNumber,
    issuedAt: creditNote.issuedAt,
    invoiceNumber: creditNote.invoice.invoiceNumber,
    invoiceIssuedAt: creditNote.invoice.issuedAt,
    seller: {
      name: creditNote.invoice.seller.name,
      address: {
        address1: creditNote.invoice.seller.address.address1,
        address2: creditNote.invoice.seller.address.address2,
        postalCode: creditNote.invoice.seller.address.postalCode,
        city: creditNote.invoice.seller.address.city,
        country: creditNote.invoice.seller.address.country,
      },
      vatNumber: creditNote.invoice.seller.vatNumber,
    },
    customer: {
      name: `${creditNote.invoice.customer.name}`,
      email: creditNote.invoice.customer.email,
      address: {
        address1: creditNote.invoice.customer.address.address1,
        address2: creditNote.invoice.customer.address.address2,
        postalCode: creditNote.invoice.customer.address.postalCode,
        city: creditNote.invoice.customer.address.city,
        country: creditNote.invoice.customer.address.country,
      },
    },
    lines: creditNote.lines.map((p) => ({
      label: p.label,
      quantity: p.quantity,
      unit: p.unit,
      unitPriceHT: p.unitPriceHT,
      vatRate: p.vatRate,
      totalHT: p.totalHT,
      totalVAT: p.totalVAT,
      totalTTC: p.totalTTC,
    })),
    totals: {
      totalHT: creditNote.totalHT,
      totalVAT: creditNote.totalVAT,
      totalTTC: creditNote.totalTTC,
    },
    reason: creditNote.reason,
  };
};

module.exports = {
  buildCreditNoteFromSubOrder,
  buildCreditNotePdfData,
};
