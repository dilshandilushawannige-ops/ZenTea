import PDFDocument from 'pdfkit';

const HEADER_FONT = 'Helvetica-Bold';
const BODY_FONT = 'Helvetica';
const THEME_PRIMARY = '#047857';
const THEME_LIGHT = '#ECFDF5';
const THEME_BORDER = '#D1FAE5';

function drawHeader(doc, { logoPath, title, dateRange, generatedBy }) {
  if (logoPath) {
    try {
      doc.image(logoPath, 50, 40, { width: 60 });
    } catch (err) {
      // ignore logo errors
    }
  }

  doc
    .fillColor('#0F172A')
    .font(HEADER_FONT)
    .fontSize(26)
    .text(`${title} Inventory Report`, logoPath ? 120 : 50, 42, { align: 'left' });

  doc
    .moveDown(0.2)
    .font(BODY_FONT)
    .fontSize(11)
    .fillColor('#334155')
    .text(`Date range: ${dateRange}`)
    .text(`Generated: ${new Date().toLocaleString()}`)
    .text(`Prepared by: ${generatedBy || 'System'}`);

  doc
    .strokeColor(THEME_BORDER)
    .lineWidth(1)
    .moveTo(50, 150)
    .lineTo(545, 150)
    .stroke();
}

const COLUMNS = [
  { key: 'name', label: 'Product', width: 140 },
  { key: 'category', label: 'Category', width: 80 },
  { key: 'batchNo', label: 'Batch', width: 70 },
  { key: 'stock', label: 'Stock', width: 50, align: 'right' },
  { key: 'minStock', label: 'Min', width: 45, align: 'right' },
  { key: 'expiryDate', label: 'Expiry', width: 80 },
  { key: 'status', label: 'Status', width: 90 },
];

function drawTableHeader(doc, y) {
  doc
    .rect(50, y, 495, 24)
    .fillAndStroke(THEME_PRIMARY, THEME_PRIMARY);

  let x = 58;
  doc
    .fillColor('#FFFFFF')
    .font(HEADER_FONT)
    .fontSize(10);

  COLUMNS.forEach((column) => {
    doc.text(column.label, x, y + 7, {
      width: column.width - 8,
      align: column.align || 'left',
    });
    x += column.width;
  });

  doc.fillColor('#0F172A');
}

function formatCell(column, value) {
  if (!value && value !== 0) return '-';
  if (column.key === 'expiryDate') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  }
  if (column.key === 'stock' || column.key === 'minStock') {
    return typeof value === 'number' ? value.toLocaleString() : value;
  }
  if (column.key === 'status') {
    return String(value).replaceAll('_', ' ');
  }
  return String(value);
}

function drawTable(doc, rows) {
  let y = 170;
  const rowHeight = 22;

  drawTableHeader(doc, y);
  y += 28;

  rows.forEach((row, index) => {
    if (y + rowHeight > 740) {
      doc.addPage();
      y = 60;
      drawTableHeader(doc, y);
      y += 28;
    }

    const isEven = index % 2 === 0;
    if (isEven) {
      doc
        .fillColor(THEME_LIGHT)
        .rect(50, y - 4, 495, rowHeight)
        .fill();
    }

    doc.fillColor('#0F172A').font(BODY_FONT).fontSize(10);
    let x = 58;
    COLUMNS.forEach((column) => {
      const value = formatCell(column, row[column.key]);
      doc.text(value, x, y - 1, {
        width: column.width - 8,
        align: column.align || 'left',
      });
      x += column.width;
    });

    y += rowHeight;
  });

  doc.fillColor('#0F172A');
}

function drawTotals(doc, totals) {
  const y = doc.y + 20;
  doc
    .save()
    .roundedRect(50, y, 495, 90, 12)
    .fillAndStroke('#FFFFFF', THEME_BORDER);

  const items = [
    { label: 'Total products', value: totals.totalProducts },
    { label: 'Total stock', value: totals.totalStock },
    { label: 'Low stock items', value: totals.lowStockCount },
    { label: 'Near expiry items', value: totals.nearExpiryCount },
  ];

  doc.restore();
  doc
    .font(HEADER_FONT)
    .fontSize(12)
    .fillColor('#0F172A')
    .text('Summary Overview', 70, y + 15);

  doc.font(BODY_FONT).fontSize(10).fillColor('#334155');
  let x = 70;
  items.forEach((item) => {
    doc.text(item.label, x, y + 40);
    doc.font(HEADER_FONT).fontSize(14).fillColor(THEME_PRIMARY).text(String(item.value), x, y + 55);
    doc.font(BODY_FONT).fontSize(10).fillColor('#334155');
    x += 120;
  });
}

function drawFooter(doc, { logoPath }) {
  const y = 760;
  doc
    .strokeColor(THEME_BORDER)
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(545, y)
    .stroke();

  doc
    .font(BODY_FONT)
    .fontSize(9)
    .fillColor('#64748B')
    .text('Tea Factory • Confidential', 50, y + 12, { align: 'left' })
    .text('Generated via ZenTea Admin', 50, y + 24, { align: 'left' });

  if (logoPath) {
    try {
      doc.image(logoPath, 490, y + 2, { width: 40 });
    } catch (err) {
      // ignore logo errors
    }
  }
}

function generateInventoryPDF({ title, dateRange, rows, totals, generatedBy, logoPath }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    drawHeader(doc, { logoPath, title, dateRange, generatedBy });
    drawTable(doc, rows);
    drawTotals(doc, totals);
    drawFooter(doc, { logoPath });

    doc.end();
  });
}

export { generateInventoryPDF };
