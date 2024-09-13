jest.mock("@clerk/clerk-sdk-node", () => {
  return {
    ClerkExpressWithAuth: jest.fn(() => {
      return (req, res, next) => {
        // Simuler l'existence d'un Bearer Token dans les headers
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1]; // Extraction du token

          // Simuler l'authentification avec le token
          if (token === "mock-valid-token") {
            console.log("Token validé avec succès");
            req.auth = { userId: "mockClerkUUID" }; // Utilisateur authentifié
          } else {
            console.log("Token invalide");
            req.auth = { userId: null }; // Token invalide
          }
        } else {
          console.log("Aucun token fourni");
          req.auth = { userId: null }; // Aucun token fourni
        }

        // Si req.auth.userId est défini, continuez
        if (req.auth && req.auth.userId) {
          next();
        } else {
          // Si req.auth.userId est null ou non défini, retournez une erreur
          console.log("Unauthorized.");
          res.status(401).json({ message: "Unauthorized." });
        }
      };
    }),
  };
});
