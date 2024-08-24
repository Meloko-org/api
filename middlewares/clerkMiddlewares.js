const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const { Webhook } = require("svix");
const { createClerkClient, verifyToken } = require('@clerk/backend')
const { getTestingKey } = require('../tests/utils')
const { User } = require('../models')

// Check the Bearer Token supplied by the frontend
const isUserLogged = async (req, res, next) => {
  try {

    if(req.query.__clerk_testing_token && req.query.__clerk_testing_user_uuid) {
      
      const testKey = await getTestingKey()
      if(req.query.__clerk_testing_token === testKey) {
        req.auth = { userId: req.query.__clerk_testing_user_uuid }
        next()
      
      }
    } else {
    // const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    // const request = new Request(fullUrl, {
    //   method: req.method,
    //   headers: req.headers,
    //   body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined
    // });

    // const clerkClient = await createClerkClient({
    //   secretKey: process.env.CLERK_SECRET_KEY,
    //   publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    // });
  
  
    // const { isSignedIn } = await clerkClient.authenticateRequest(request, {
    //   jwtKey: process.env.CLERK_JWT_KEY
    // });
    
    // console.log(isSignedIn)
    // const bearerToken = req.headers.authorization
    // const JwtToken = bearerToken.replace('Bearer ', '')
    // const payload = await verifyToken(JwtToken, {
    //   jwtKey: process.env.CLERK_JWT_KEY,
    //   debug: true 
    // })
    // console.log(payload)
    // console.log(JwtToken)

    // if(payload.sub) {
    //   req.auth = { userId: payload.sub }
    //   next();
    // } else {
    //   console.error('Unauthorized.')
    //   return res.status(401).json({ message: 'Unauthorized.' });
    // }

    // // Use Clerk's built-in middleware
    ClerkExpressWithAuth()(req, res, (err) => {
      // if req.auth.userId is null
      if (!req.auth.userId) {
        console.error('Unauthorized.')
        return res.status(401).json({ message: 'Unauthorized.' });
      }
  
      // If authenticated, proceed to the controller
      next();
    });
    }

  } catch (error) {
    console.error(error)
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
  } catch(error) {
    console.error(error)
    res.status(401).json({ error: error.message })
  }

};

module.exports = {
  isUserLogged,
  isWebhookSignedByClerk
}