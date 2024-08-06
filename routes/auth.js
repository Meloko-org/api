var express = require('express');
var router = express.Router();
const { clerkMiddlewares } = require('../middlewares')

router.get('/login', clerkMiddlewares.isUserLogged, function(req, res, next) {
  console.log(req.auth.userId)
  res.json({ result: true, auth: req.auth.userId});
});

module.exports = router;
