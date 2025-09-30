const mongoose = require("mongoose");

/* Permet de convertir un Decimal128 en number 
  A utiliser dans chaque model
*/
function decimal128ToJSON(schema) {
  schema.set("toJSON", {
    transform: (doc, ret) => {
      for (const key in ret) {
        if (
          ret[key] &&
          typeof ret[key] === "object" &&
          typeof ret[key].toString === "function"
        ) {
          try {
            // Si c’est un Decimal128 → on convertit en number
            const asNumber = parseFloat(ret[key].toString());
            if (!isNaN(asNumber)) {
              ret[key] = asNumber;
            }
          } catch (e) {
            // On ignore si ça ne marche pas
          }
        }
      }
      return ret;
    },
  });
}

/* Permet de convertir un number en Decimal128 
  A utiliser dans chaque model
*/
function numberToDecimal128(schema) {
  schema.eachPath((path, schemaType) => {
    if (schemaType.instance === "Decimal128") {
      schemaType.set(function (val) {
        if (val == null) return val;
        if (val._bsontype === "Decimal128") return val;
        return mongoose.Types.Decimal128.fromString(val.toString());
      });
    }
  });
}

module.exports = {
  decimal128ToJSON,
  numberToDecimal128,
};
