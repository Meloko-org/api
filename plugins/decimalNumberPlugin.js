const mongoose = require("mongoose");

/*
    Ce plugin permet de convertir des decimal128 en number quand on extrait
    des données de la base et il permet aussi de convertir des number en
    decimal128 quand on injecte des données dans la base.
 */

function decimalNumberPlugin(schema) {
  // 1️⃣ Conversion automatique JSON (Decimal128 → number)
  schema.set("toJSON", {
    transform: (doc, ret) => {
      function convert(obj) {
        if (obj && typeof obj === "object") {
          // Cas spécifique : Decimal128
          if (obj._bsontype === "Decimal128") {
            try {
              return parseFloat(obj.toString());
            } catch {
              return obj;
            }
          }

          // Cas spécifique : ObjectId → ne pas toucher
          if (obj._bsontype === "ObjectID") {
            return obj;
          }

          // Cas spécifique : Date → ne pas toucher
          if (obj instanceof Date) {
            return obj;
          }

          // Parcours récursif
          for (const key in obj) {
            obj[key] = convert(obj[key]);
          }
        }
        return obj;
      }
      return convert(ret);
    },
  });

  // 2️⃣ Conversion automatique lors des set (number → Decimal128)
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

// 👉 Application globale à tous les schémas
mongoose.plugin(decimalNumberPlugin);

module.exports = {
  decimalNumberPlugin,
};
