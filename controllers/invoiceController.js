const { Invoice, User, Shop } = require("../models");
const { hasShop } = require("../helpers/authHelpers");
const { buildInvoicePdfData } = require("../builders/invoiceBuilder");
const { generateInvoicePdf } = require("../pdf/invoicePdf");
const { canAccessInvoice } = require("../modules/PdfAccessRules");

const getInvoicePdf = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const invoiceId = req.params.id;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ succes: false, message: "Invoice not found." });
    }

    const allowed = await canAccessInvoice({ userId, invoice });
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    const pdfData = buildInvoicePdfData(invoice);
    const pdfBuffer = await generateInvoicePdf(pdfData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${invoice.invoiceNumber}.pdf`,
    );

    // console.log("PDF buffer type:", pdfBuffer.constructor.name);
    // console.log("PDF buffer length:", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "PDF generation failed" });
  }
};

module.exports = {
  getInvoicePdf,
};
