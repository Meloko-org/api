const VALID_STATUSES = ["pending", "validated", "withdrawn", "canceled"];

function computeGlobalOrderStatus(order) {
  const subStatuses = order.details
    .map((d) => d.status)
    .filter((s) => VALID_STATUSES.includes(s));

  const unique = Array.from(new Set(subStatuses));

  if (unique.length === 1) {
    return [unique[0]];
  }

  return unique.map(
    (status) => "partial" + status.charAt(0).toUpperCase() + status.slice(1),
  );
}

const UNIT_DIVISOR = {
  gr: 1000,
  kg: 1,
  piece: 1,
};

function computeShopAmounts(products) {
  let shopTotalHT = 0;
  let shopTotalVAT = 0;
  let shopTotalTTC = 0;

  products.forEach((p) => {
    // sécurité pour éviter un NAN
    const quantity = Number(p.quantity) || 0;
    const unitPriceHT = Number(p.unitPriceHT) || 0;
    const totalPriceTTC = Number(p.totalPriceTTC) || 0;
    const unitDiv = UNIT_DIVISOR[p.unit] ?? 1;

    const amountProductHT = Math.round((unitPriceHT * quantity) / unitDiv);
    const amountProductVAT = totalPriceTTC - amountProductHT;

    shopTotalHT += amountProductHT;
    shopTotalVAT += amountProductVAT;
    shopTotalTTC += totalPriceTTC;
  });
  return { shopTotalHT, shopTotalVAT, shopTotalTTC };
}

// calcule les différents montants d'un produit selon la quantité et l'unit
function computeTotalsFromHT(product) {
  const quantity = Number(product.quantity) || 0;
  const unitPriceHT = Number(product.unitPriceHT) || 0;
  const totalPriceTTC = Number(product.totalPriceTTC) || 0;
  const unitDiv = UNIT_DIVISOR[product.unit] ?? 1;

  const totalHT = Math.round((unitPriceHT * quantity) / unitDiv);
  const totalVAT = totalPriceTTC - totalHT;

  return { totalHT, totalVAT };
}

function recomputeOrderTotals(order) {
  order.totalHT = order.details.reduce(
    (sum, so) => sum + (so.shopTotalHT || 0),
    0,
  );
  order.totalVAT = order.details.reduce(
    (sum, so) => sum + (so.shopTotalVAT || 0),
    0,
  );
  order.totalTTC = order.details.reduce(
    (sum, so) => sum + (so.shopTotalTTC || 0),
    0,
  );
}

module.exports = {
  computeGlobalOrderStatus,
  computeShopAmounts,
  computeTotalsFromHT,
  recomputeOrderTotals,
};
