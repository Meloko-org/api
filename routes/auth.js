var express = require('express');
var router = express.Router();
const { clerkAuthMiddleware } = require('../middlewares')

router.get('/login', clerkAuthMiddleware, function(req, res, next) {
  console.log(req.auth.userId)
  res.json({ result: true, auth: req.auth.userId});
});

module.exports = router;
