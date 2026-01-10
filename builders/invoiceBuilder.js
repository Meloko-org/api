const { computeTotalsFromHT } = require("../helpers/orderHelpers");

function buildInvoiceFromOrder({
  order,
  subOrder,
  invoiceNumber,
  confirmedProducts,
}) {
  const lines = confirmedProducts.map(buildInvoiceLine);

  const totalHT = lines.reduce((sum, l) => sum + l.totalHT, 0);
  const totalVAT = lines.reduce((sum, l) => sum + l.totalVAT, 0);
  const totalTTC = lines.reduce((sum, l) => sum + l.totalTTC, 0);

  return {
    shop: subOrder.shop._id,
    order: order._id,
    subOrder: subOrder._id,
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
  const customer = invoice.customer;
  const seller = invoice.seller;

  return {
    shop: invoice.shop,
    order: invoice.order,
    invoiceNumber: invoice.invoiceNumber,
    issuedAt: new Date(),
    customer: {
      name: `${customer.name}`,
      email: customer.email,
      address: {
        address1: customer.address.address1,
        address2: customer.address.address2,
        postalCode: customer.address.postalCode,
        city: customer.address.city,
        country: customer.address.country,
      },
    },
    seller: {
      name: seller.name,
      address: {
        address1: seller.address.address1,
        address2: seller.address.address2,
        postalCode: seller.address.postalCode,
        city: seller.address.city,
        country: seller.address.country,
      },
      vatNumber: invoice.seller.vatNumber,
    },
    lines: invoice.lines.map((line) => ({
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
