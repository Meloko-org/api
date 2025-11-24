function eurosToCents(euros) {
  return Math.round(Number(euros) * 100);
}

function centsToEuros(cents) {
  return Number(cents) / 100;
}

/* retourne le prix HT et le montant TVA en cents d'un produit  */
function computeHTandVAT(priceTTC_cents, vatRate) {
  const priceTTC = priceTTC_cents / 100;
  const priceHT = priceTTC / (1 + vatRate / 100);
  const vat = priceTTC - priceHT;

  return {
    productPriceHT: Math.round(priceHT * 100),
    productVAT: Math.round(vat * 100),
  };
}

module.exports = {
  eurosToCents,
  centsToEuros,
  computeHTandVAT,
};
