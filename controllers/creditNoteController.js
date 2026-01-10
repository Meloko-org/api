const { CreditNote } = require("../models");
const { hasShop } = require("../helpers/authHelpers");
const { buildCreditNotePdfData } = require("../builders/creditNoteBuilder");
const { generateCreditNotePdf } = require("../pdf/creditNotePdf");

const getCreditNotePdf = async (req, res) => {
  console.log("youpi");
  try {
    const shop = await hasShop(req.auth.userId);
    if (!shop) {
      return res
        .status(404)
        .json({ succes: false, message: "Shop not found." });
    }

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

    if (!creditNote.shop.equals(shop._id)) {
      return res.status(404).json({ succes: false, message: "forbidden." });
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
