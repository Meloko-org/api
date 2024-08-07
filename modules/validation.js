function checkBody(body, keys) {
  let isValid = true;
  for (const field of keys) {
    if (!(field in body)) {
      isValid = false;
    }
  }

  return isValid;
}

module.exports = { checkBody };
