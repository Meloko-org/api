const { CreditNote } = require("../models");
const { hasShop } = require("../helpers/authHelpers");
const { buildCreditNotePdfData } = require("../builders/creditNoteBuilder");
const { generateCreditNotePdf } = require("../pdf/creditNotePdf");
const { canAccessCreditNote } = require("../modules/PdfAccessRules");

const getCreditNotePdf = async (req, res) => {
  console.log("youpi");
  try {
    const userId = req.auth.userId;
    const creditNoteId = req.params.id;

    const creditNote = await CreditNote.findById(creditNoteId).populate({
      path: "invoice",
      select: "invoiceNumber issuedAt", // strict minimum
    });

    if (!creditNote) {
      return res
        .status(404)
        .json({ succes: false, message: "Invoice not found." });
    }

    const allowed = await canAccessCreditNote({ userId, creditNote });
    if (!allowed) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }

    const pdfData = buildCreditNotePdfData(creditNote);
    const pdfBuffer = await generateCreditNotePdf(pdfData);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${creditNote.creditNoteNumber}.pdf`,
    );

    console.log("PDF buffer type:", pdfBuffer.constructor.name);
    console.log("PDF buffer length:", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "PDF generation failed" });
  }
};

module.exports = {
  getCreditNotePdf,
};
