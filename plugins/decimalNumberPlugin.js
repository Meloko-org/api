const mongoose = require("mongoose");

/* 
  Ce plugin permet de transformer des decimal128 en number dans le cas d'un agregate
  ou d'une res.json (toJSON) quand on extrait des données.
  Et permet de transformer des number en decimal128 avant d'injecter des données.
 */

function convertDecimal(obj, seen = new WeakSet()) {
  if (obj && typeof obj === "object") {
    if (seen.has(obj)) return obj;
    seen.add(obj);

    if (obj._bsontype === "Decimal128") {
      try {
        return parseFloat(obj.toString());
      } catch {
        return obj;
      }
    }

    // ⚠️ Ne touche jamais aux ObjectId ou Dates
    if (obj._bsontype === "ObjectID" || obj instanceof Date) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => convertDecimal(item, seen));
    } else {
      for (const key of Object.keys(obj)) {
        obj[key] = convertDecimal(obj[key], seen);
      }
      return obj;
    }
  }
  return obj;
}

function decimalNumberPlugin(schema) {
  // ✅ 1. Conversion uniquement à la sortie JSON
  schema.set("toJSON", {
    transform: (doc, ret) => convertDecimal(ret),
  });

  // ✅ 2. Conversion pour les agrégations uniquement
  schema.post(["aggregate"], function (result) {
    if (!result) return;
    if (Array.isArray(result)) {
      result.forEach((item) => convertDecimal(item));
    } else {
      convertDecimal(result);
    }
  });

  // ✅ 3. Conversion number → Decimal128
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
