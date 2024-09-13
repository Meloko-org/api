const mongoose = require("mongoose");

/**
 * L'utilisation de mongodb-memory-server pour faire des tests oblige à tester
 * l'environnement avant de déclencher une connexion.
 * En production, on déclenche mongoose.connect avec process.env.CONNECTION_STRING
 * En phase de test, mongodb-memory-server déclenche mongoose.connect avec sa propre connection_string
 */

if (process.env.NODE_ENV !== "test") {
  const connectionString = process.env.CONNECTION_STRING;

  mongoose
    .connect(connectionString, { connectTimeoutMS: 2000 })
    .then(() => console.log("Database connected"))
    .catch((error) => console.error(error));
}
