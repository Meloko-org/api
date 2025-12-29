function eurosToCents(euros) {
  return Math.round(Number(euros) * 100);
}

function centsToEuros(cents) {
  return Number(cents) / 100;
}

/* retourne le prix HT et le montant TVA en cents d'un produit  */
function computeHTandVAT(priceTTC_cents, vatRate) {
  if (typeof priceTTC_cents !== "number" || isNaN(priceTTC_cents)) {
    throw new Error("priceTTC_cents invalide");
  }
  const divisor = 1 + vatRate / 100.0;

  const unitPriceHT_cents = Math.round(priceTTC_cents / divisor);
  const unitVAT_cents = priceTTC_cents - unitPriceHT_cents;

  return {
    unitPriceHT_cents,
    unitVAT_cents,
  };
}

module.exports = {
  eurosToCents,
  centsToEuros,
  computeHTandVAT,
};
