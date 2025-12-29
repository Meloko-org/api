const { computeTotalsFromHT } = require("../helpers/orderHelpers");

function buildInvoiceFromOrder({ order, subOrder, invoiceNumber }) {
  const confirmedProducts = subOrder.products.filter((p) => p.isConfirmed);

  const lines = confirmedProducts.map(buildInvoiceLine);

  const totalHT = lines.reduce((sum, l) => sum + l.totalHT, 0);
  const totalVAT = lines.reduce((sum, l) => sum + l.totalVAT, 0);
  const totalTTC = lines.reduce((sum, l) => sum + l.totalTTC, 0);

  return {
    shop: subOrder.shop._id,
    order: order._id,
    subOrderId: subOrder._id,
    invoiceNumber,
    issuedAt: new Date(),
    currency: "EUR",

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

    status: "issued",
  };
}

function buildInvoiceLine(confirmedProduct) {
  const { quantity, unitPriceHT, totalPriceTTC } = confirmedProduct;
  const vatRate = confirmedProduct.product.product.vatRate;
  const unit = confirmedProduct.product.product.weight.unit;

  const { totalHT, totalVAT } = computeTotalsFromHT(confirmedProduct);

  return {
    label: getInvoiceProductName(confirmedProduct.product),
    quantity,
    unit,
    unitPriceHT,
    vatRate,
    totalHT,
    totalVAT,
    totalTTC: totalPriceTTC,
  };
}

function getInvoiceProductName(stock) {
  if (stock.productCustomName?.trim()) {
    return stock.productCustomName;
  }

  const familyName = stock.product.family.name ?? "";
  const productName = stock.product.name ?? "";

  return `${familyName} ${productName}`.trim();
}

const buildInvoicePdfData = (invoice) => {
  return {
    shop: invoice.shop,
    order: invoice.order,
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: new Date(),
    customer: {
      name: `${invoice.customer.name}`,
      email: invoice.customer.email,
      address: {
        address1: invoice.customer.address.address1,
        address2: invoice.customer.address.address2,
        postalCode: invoice.customer.address.postalCode,
        city: invoice.customer.address.city,
        country: invoice.customer.address.country,
      },
    },
    seller: {
      name: invoice.seller.name,
      address: {
        address1: invoice.seller.address.address1,
        address2: invoice.seller.address.address2,
        postalCode: invoice.seller.address.postalCode,
        city: invoice.seller.address.city,
        country: invoice.seller.address.country,
      },
      vatNumber: invoice.seller.vatNumber,
    },
    lines: invoice.lines.map((p) => ({
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
      totalHT: invoice.totalHT,
      totalVAT: invoice.totalVAT,
      totalTTC: invoice.totalTTC,
    },
  };
};

module.exports = {
  buildInvoiceFromOrder,
  buildInvoicePdfData,
};
