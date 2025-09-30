import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generateReceiptPDF = async (filePath, { logoPath, title, supplier, collection, transaction }) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    if (logoPath && fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 60 });
    }
    doc.fontSize(20).text(title || 'Payment Slip', 120, 50);
    doc.moveDown();

    doc.fontSize(12).text(`Transaction ID: ${transaction.transactionId}`);
    doc.text(`Date/Time: ${new Date(transaction.createdAt || Date.now()).toLocaleString()}`);
    doc.moveDown();

    if (supplier) {
      doc.text(`Supplier: ${supplier.name} (${supplier.uniqueId})`);
      if (supplier.company) doc.text(`Company: ${supplier.company}`);
    }
    doc.moveDown();

    if (collection) {
      doc.text(`Weight (kg): ${collection.weightKg}`);
      doc.text(`Rate (LKR/kg): ${collection.rate}`);
      doc.text(`Total Amount (LKR): ${collection.total}`);
      doc.text(`Collector: ${collection.collectorId}`);
      doc.text(`Collected Date: ${new Date(collection.date).toLocaleDateString()}`);
    }

    doc.moveDown();
    doc.text('Authorized Signature: __________________________');

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};
