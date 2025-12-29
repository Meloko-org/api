var express = require("express");
var router = express.Router();
const { clerkMiddlewares } = require("../middlewares");
const { invoiceController } = require("../controllers");

router.get(
  "/:id/pdf",
  clerkMiddlewares.isUserLogged,
  invoiceController.getInvoicePdf,
);

module.exports = router;
