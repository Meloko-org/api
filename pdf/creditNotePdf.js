const PDFDocument = require("pdfkit");

const generateCreditNotePdf = async (creditNote, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // ---- TITRE
      doc.fontSize(20).text("AVOIR", { align: "center" });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Avoir n° : ${creditNote.creditNoteNumber}`);
      doc.text(
        `Date d'émission: ${creditNote.issuedAt.toLocaleDateString("fr-FR")}`,
      );

      doc.moveDown();

      // ---- RÉFÉRENCE FACTURE
      if (creditNote.invoiceNumber) {
        doc.text(`Facture d’origine : ${creditNote.invoiceNumber}`);
      }

      if (creditNote.invoiceIssuedAt) {
        doc.text(
          `Date facture : ${creditNote.invoiceIssuedAt.toLocaleDateString("fr-FR")}`,
        );
      }

      doc.moveDown();

      // ---- VENDEUR
      doc.text("VENDEUR", { underline: true });
      doc.text(creditNote.seller.name);
      doc.text(creditNote.seller.address.address1);
      if (creditNote.seller.address.address2) {
        doc.text(creditNote.seller.address.address2);
      }
      doc.text(
        creditNote.seller.address.postalCode +
          " " +
          creditNote.seller.address.city,
      );
      doc.text(`SIRET : ${creditNote.seller.siret}`);

      if (creditNote.seller.vatNumber) {
        doc.text(`TVA : ${creditNote.seller.vatNumber}`);
      }

      doc.moveDown();

      // ---- CLIENT
      doc.text("CLIENT", { underline: true });
      doc.text(creditNote.customer.name);
      doc.text(creditNote.customer.address.address1);
      if (creditNote.customer.address.address2) {
        doc.text(creditNote.customer.address.address2);
      }
      doc.text(
        `${creditNote.customer.address.postalCode} ${creditNote.customer.address.city}`,
      );

      doc.moveDown();

      // ---- LIGNES
      doc.text("DÉTAIL DE L'AVOIR", { underline: true });
      doc.moveDown(0.5);

      creditNote.lines.forEach((l) => {
        doc.text(
          `${l.label} – ${l.quantity} ${l.unit} x ${(l.unitPriceHT / 100).toFixed(2)} € HT`,
        );
        doc.text(`TVA ${l.vatRate}% – ${(l.totalTTC / 100).toFixed(2)} € TTC`, {
          indent: 20,
        });
        doc.moveDown(0.5);
      });

      doc.moveDown();

      // ---- TOTAUX
      doc.text(
        `Total HT annulé : ${(creditNote.totals.totalHT / 100).toFixed(2)} €`,
      );
      doc.text(
        `Total TVA annulé : ${(creditNote.totals.totalVAT / 100).toFixed(2)} €`,
      );
      doc.text(
        `Total TTC annulé : ${(creditNote.totals.totalTTC / 100).toFixed(2)} €`,
        {
          bold: true,
        },
      );

      doc.moveDown();

      // ---- MOTIF
      if (creditNote.reason) {
        doc.text("Motif :", { underline: true });
        doc.text(creditNote.reason);
      }

      doc.moveDown();

      if (creditNote.status === "refunded") {
        doc.text(
          `remboursement effectué le : ${creditNote.issuedAt.toLocaleDateString("fr-FR")}`,
        );
        doc.text(`référence stripe : ${creditNote.stripeRefundId}`);
      } else {
        doc.text("Remboursement en attente.");
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateCreditNotePdf,
};
