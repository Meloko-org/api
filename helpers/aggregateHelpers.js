const mongoose = require("mongoose");

/* Permet de convertir des decimal128 dus à un aggregate en number.
	Permet de convertir les objectId retournées en format brut BSON 
	par l'aggregate en string.
  A utiliser après chaque aggregate dans les controllers
*/
function cleanMongoDoc(doc) {
  if (Array.isArray(doc)) {
    return doc.map((item) => cleanMongoDoc(item));
  }

  if (doc && typeof doc === "object") {
    // ObjectId → string
    if (doc instanceof mongoose.Types.ObjectId) {
      return doc.toString();
    }

    // Decimal128 → number
    if (doc instanceof mongoose.Types.Decimal128) {
      return parseFloat(doc.toString());
    }

    // Parcours récursif des objets
    const cleaned = {};
    for (const key in doc) {
      cleaned[key] = cleanMongoDoc(doc[key]);
    }
    return cleaned;
  }

  return doc;
}

module.exports = {
  cleanMongoDoc,
};
