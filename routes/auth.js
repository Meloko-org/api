var express = require("express");
var router = express.Router();
const { clerkMiddlewares } = require("../middlewares");

router.get("/login", clerkMiddlewares.isUserLogged, function (req, res, next) {
  res.json({ result: true, auth: req.auth.userId });
});

module.exports = router;
