function checkBody(body, keys) {
  let isValid = true;
  for (const field of keys) {
    if (!(field in body)) {
      isValid = false;
    }
  }

  return isValid;
}

function isAddressComplete(adr) {
  if (!adr.address) return false;
  const a = adr.address;

  const isPostalCodeValid = /^[0-9]{5}$/.test(a.postalCode);

  return a.address1 && a.postalCode && a.city && a.country && isPostalCodeValid;
}

module.exports = {
  checkBody,
  isAddressComplete,
};
