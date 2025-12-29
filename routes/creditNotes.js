var express = require("express");
var router = express.Router();
const { clerkMiddlewares } = require("../middlewares");
const { creditNoteController } = require("../controllers");

router.get(
  "/:id/pdf",
  clerkMiddlewares.isUserLogged,
  creditNoteController.getCreditNotePdf,
);

module.exports = router;
