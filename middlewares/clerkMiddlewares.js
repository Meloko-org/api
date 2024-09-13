const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const { Webhook } = require("svix");
const { createClerkClient, verifyToken } = require("@clerk/backend");

// Check the Bearer Token supplied by the frontend
const isUserLogged = async (req, res, next) => {
  try {
    ClerkExpressWithAuth()(req, res, (err) => {
      if (err) {
        console.error("Erreur dans ClerkExpressWithAuth :", err);
        return res.status(500).json({ message: "Internal server error." });
      }

      // if req.auth.userId is null
      if (!req.auth || !req.auth.userId) {
        console.error("Non autorisé : req.auth.userId est null ou non défini.");
        return res.status(401).json({ message: "Unauthorized." });
      }

      // If authenticated, proceed to the controller
      console.log(
        "Authentification réussie pour l'utilisateur :",
        req.auth.userId,
      );
      next();
    });
  } catch (error) {
    // console.error("Erreur interne dans isUserLogged :", error)
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Check if the request is a signed one from Clerk
const isWebhookSignedByClerk = async (req, res, next) => {
  try {
    // Use Svix to verify the request
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    const payload = JSON.stringify(req.body);

    const wh = new Webhook(secret);
    // Throws on error, returns the verified content on success
    const verify = wh.verify(payload, req.headers);
    // If authenticated, proceed to the controller
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: error.message });
  }
};

module.exports = {
  isUserLogged,
  isWebhookSignedByClerk,
};
