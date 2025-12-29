const PDFDocument = require("pdfkit");

const generateInvoicePdf = async (invoice) => {
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
      doc.fontSize(20).text("FACTURE", { align: "center" });
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`Facture n° : ${invoice.invoiceNumber}`);
      doc.text(`Date : ${invoice.issuedAt.toLocaleDateString("fr-FR")}`);

      doc.moveDown();

      // ---- VENDEUR
      doc.text("VENDEUR", { underline: true });
      doc.text(invoice.seller.name);
      doc.text(invoice.seller.address.address1);
      if (invoice.seller.address.address2) {
        doc.text(invoice.seller.address.address2);
      }
      doc.text(
        invoice.seller.address.postalCode + " " + invoice.seller.address.city,
      );
      doc.text(`SIRET : ${invoice.seller.vatNumber}`);

      if (invoice.seller.vatNumber) {
        doc.text(`TVA : ${invoice.seller.vatNumber}`);
      }

      doc.moveDown();

      // ---- CLIENT
      doc.text("CLIENT", { underline: true });
      doc.text(invoice.customer.name);
      doc.text(invoice.customer.address.address1);
      if (invoice.customer.address.address2) {
        doc.text(invoice.customer.address.address2);
      }
      doc.text(
        invoice.customer.address.postalCode +
          " " +
          invoice.customer.address.city,
      );

      doc.moveDown();

      // ---- LIGNES
      doc.text("DÉTAIL", { underline: true });
      doc.moveDown(0.5);

      invoice.lines.forEach((l) => {
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
      doc.text(`Total HT : ${(invoice.totals.totalHT / 100).toFixed(2)} €`);
      doc.text(`Total TVA : ${(invoice.totals.totalVAT / 100).toFixed(2)} €`);
      doc.text(`Total TTC : ${(invoice.totals.totalTTC / 100).toFixed(2)} €`, {
        bold: true,
      });

      doc.moveDown();

      // ---- MENTIONS
      if (invoice.vatExemption) {
        doc.text("TVA non applicable, article 293B du CGI", { italic: true });
      }

      doc.end();

      // return Buffer.concat(buffers);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePdf,
};
