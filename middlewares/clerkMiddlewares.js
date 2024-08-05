const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const { Webhook } = require("svix");
// const { createClerkClient } = require('@clerk/backend')

// Check the Bearer Token supplied by the frontend
const clerkAuthMiddleware = async (req, res, next) => {
  try {
    // const clerkClient = createClerkClient({
    //   secretKey: process.env.CLERK_SECRET_KEY,
    //   publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    // });
  
  
    // const { isSignedIn } = await clerkClient.authenticateRequest(req, {
    //   jwtKey: process.env.CLERK_JWT_KEY
    // });
    
    // console.log(isSignedIn)
    // Use Clerk's built-in middleware
    ClerkExpressWithAuth()(req, res, (err) => {
      console.log(req.auth)
      // if req.auth.userId is null
      if (!req.auth.userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }
  
      // If authenticated, proceed to the controller
      next();
    });
  } catch (error) {
    console.error(error)
  }

};

// Check if the request is a signed one from Clerk 
const clerkWebhookVerifyMiddleware = async (req, res, next) => {
  try {
    // Use Svix to verify the request
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    const payload = JSON.stringify(req.body);
    
    const wh = new Webhook(secret);
    // Throws on error, returns the verified content on success
    const verify = wh.verify(payload, req.headers);
    // console.log("verify ------")
    // console.log(verify)
    // If authenticated, proceed to the controller
    next();
  } catch(error) {
    console.error(error)
    res.status(400).json({ result: false, error: { message: error }})
  }

};

module.exports = {
  clerkAuthMiddleware,
  clerkWebhookVerifyMiddleware
}