import PDFDocument from "pdfkit";
import fs from "fs";

const safeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (value) =>
  `LKR ${safeNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatHours = (value) => `${safeNumber(value).toFixed(1)} hrs`;

const formatMonthLabel = (month) => {
  if (!month) return "";
  const parsed = new Date(`${month}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return month;
  try {
    return parsed.toLocaleString("default", { month: "long", year: "numeric" });
  } catch (err) {
    return month;
  }
};

const listRowHeights = (items) => items.map((item) => (item.helper ? 34 : 22));

const calculateListCardHeight = (items) => {
  const padding = 22;
  return padding * 2 + 16 + listRowHeights(items).reduce((sum, h) => sum + h, 0);
};

const drawListCard = (doc, { title, x, y, width, items }) => {
  const padding = 22;
  const rowHeights = listRowHeights(items);
  const contentHeight = rowHeights.reduce((sum, h) => sum + h, 0);
  const cardHeight = padding * 2 + 16 + contentHeight;

  doc.save();
  doc.roundedRect(x, y, width, cardHeight, 14).fill("#ffffff");
  doc.restore();

  doc.save();
  doc.roundedRect(x, y, width, cardHeight, 14).lineWidth(1).stroke("#e2e8f0");
  doc.restore();

  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text(title, x + padding, y + padding - 4, {
    width: width - padding * 2,
  });

  doc.save();
  doc
    .strokeColor("#e2e8f0")
    .lineWidth(1)
    .moveTo(x + padding, y + padding + 14)
    .lineTo(x + width - padding, y + padding + 14)
    .stroke();
  doc.restore();

  let rowCursor = y + padding + 24;
  items.forEach((item, index) => {
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#64748b")
      .text(item.label, x + padding, rowCursor, { width: width / 2 - padding });
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#0f172a")
      .text(item.value, x + padding, rowCursor, {
        width: width - padding * 2,
        align: "right",
      });

    if (item.helper) {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#94a3b8")
        .text(item.helper, x + padding, rowCursor + 16, {
          width: width - padding * 2,
        });
    }

    rowCursor += rowHeights[index];
  });

  return cardHeight;
};

export const generatePayslipPDF = async (
  filePath,
  { logoPath, employee, breakdown }
) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;
    const gap = 18;

    const issuedOn = new Date();
    const monthLabel = formatMonthLabel(breakdown.month);

    const weekDayHours = safeNumber(breakdown.weekdayOtHours);
    const holidayHours = safeNumber(breakdown.holidayOtHours);
    const totalHours = weekDayHours + holidayHours;
    const weekdayOtAmount = safeNumber(breakdown.weekdayOT);
    const holidayOtAmount = safeNumber(breakdown.holidayOT);
    const overtimeAmount = weekdayOtAmount + holidayOtAmount;
    const otherDeductions = safeNumber(breakdown.otherDeductions || breakdown.deductions);
    const totalDeductions =
      safeNumber(breakdown.epf) +
      safeNumber(breakdown.etf) +
      safeNumber(breakdown.loan) +
      otherDeductions;

    const refreshBackground = () => {
      doc.save();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#f8fafc");
      doc.restore();
    };

    refreshBackground();

    doc.fillColor("#0f172a");

    let currentY = doc.page.margins.top;

    const ensureSpace = (height) => {
      const bottomLimit = doc.page.height - doc.page.margins.bottom;
      if (currentY + height > bottomLimit) {
        doc.addPage();
        refreshBackground();
        doc.fillColor("#0f172a");
        currentY = doc.page.margins.top;
      }
    };

    // Header Card
    const headerHeight = 120;
    const headerTop = 35;

    doc.save();
    const headerGradient = doc.linearGradient(left, headerTop, left + pageWidth, headerTop + headerHeight);
    headerGradient.stop(0, "#047857").stop(1, "#0c4a6e");
    doc.roundedRect(left, headerTop, pageWidth, headerHeight, 18).fill(headerGradient);
    doc.restore();

    if (logoPath && fs.existsSync(logoPath)) {
      doc.image(logoPath, left + 26, headerTop + 26, { width: 60 });
    }

    doc
      .fillColor("#ecfdf5")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("ZenTea Payroll", left + 110, headerTop + 30, {
        width: pageWidth - 220,
      });

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#d1fae5")
      .text(
        `Payslip for ${monthLabel || "this period"}`,
        left + 110,
        headerTop + 64,
        {
          width: pageWidth - 220,
        }
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#ecfdf5")
      .text(`Slip #${breakdown.slipNo || "N/A"}`, left + pageWidth - 190, headerTop + 34, {
        width: 160,
        align: "right",
      })
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#ccfbf1")
      .text(`Issued ${issuedOn.toLocaleDateString()}`, {
        width: 160,
        align: "right",
      });

    currentY = headerTop + headerHeight + 28;

    // Summary cards (two columns)
    const summaryCards = [
      {
        title: "Net Pay",
        value: formatCurrency(breakdown.net),
        subtitle: "Take home after deductions",
      },
      {
        title: "Gross Salary",
        value: formatCurrency(breakdown.gross),
        subtitle: "Before statutory deductions",
      },
      {
        title: "Overtime",
        value: formatCurrency(overtimeAmount),
        subtitle: `${formatHours(totalHours)} logged · ${formatHours(weekDayHours)} weekday · ${formatHours(
          holidayHours
        )} holiday`,
      },
      {
        title: "Loan Balance",
        value: formatCurrency(breakdown.loan),
        subtitle: "Outstanding payroll loan",
      },
    ];

    const cardWidth = (pageWidth - gap) / 2;
    const cardHeight = 96;
    summaryCards.forEach((card, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const cardX = left + column * (cardWidth + gap);
      const cardY = currentY + row * (cardHeight + gap);

      doc.save();
      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 16).fill("#ffffff");
      doc.restore();

      doc.save();
      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 16).lineWidth(1).stroke("#e2e8f0");
      doc.restore();

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#475569")
        .text(card.title, cardX + 20, cardY + 18, { width: cardWidth - 40 });

      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .fillColor("#0f172a")
        .text(card.value, cardX + 20, cardY + 40, { width: cardWidth - 40 });

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#64748b")
        .text(card.subtitle, cardX + 20, cardY + 70, {
          width: cardWidth - 40,
        });
    });

    const summaryRows = Math.ceil(summaryCards.length / 2);
    currentY += summaryRows * (cardHeight + gap) + 16;

    // Employee & payout info card
    const infoCardHeight = 160;
    ensureSpace(infoCardHeight + 24);
    doc.save();
    doc.roundedRect(left, currentY, pageWidth, infoCardHeight, 16).fill("#ffffff");
    doc.restore();
    doc.save();
    doc.roundedRect(left, currentY, pageWidth, infoCardHeight, 16).lineWidth(1).stroke("#e2e8f0");
    doc.restore();

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("#0f172a")
      .text("Employee Overview", left + 24, currentY + 20);

    const infoItems = [
      {
        label: "Employee",
        value:
          employee?.name || breakdown.employeeName || breakdown.name || breakdown.employeeId || "-",
      },
      {
        label: "Employee ID",
        value: employee?.employeeId || breakdown.employeeId || "-",
      },
      { label: "Period", value: monthLabel || "-" },
      { label: "Slip Number", value: breakdown.slipNo || "-" },
      { label: "Generated", value: issuedOn.toLocaleString() },
      { label: "Take-home", value: formatCurrency(breakdown.net) },
    ];

    infoItems.forEach((item, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const columnWidth = pageWidth / 3;
      const itemX = left + column * columnWidth;
      const itemY = currentY + 56 + row * 32;

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#94a3b8")
        .text(item.label.toUpperCase(), itemX + 24, itemY, {
          width: columnWidth - 48,
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor("#0f172a")
        .text(item.value, itemX + 24, itemY + 12, {
          width: columnWidth - 48,
        });
    });

    currentY += infoCardHeight + 24;

    // Earnings and Deductions cards
    const earningsItems = [
      { label: "Basic Salary", value: formatCurrency(breakdown.basic) },
      { label: "Allowances", value: formatCurrency(breakdown.allowances) },
      {
        label: "Weekday OT",
        value: formatCurrency(weekdayOtAmount),
        helper: `${formatHours(weekDayHours)} recorded`,
      },
      {
        label: "Holiday OT",
        value: formatCurrency(holidayOtAmount),
        helper: `${formatHours(holidayHours)} recorded`,
      },
      { label: "Bonus", value: formatCurrency(breakdown.bonus) },
      { label: "Gross Salary", value: formatCurrency(breakdown.gross) },
    ];

    const deductionItems = [
      { label: "EPF (20%)", value: formatCurrency(breakdown.epf) },
      { label: "ETF (3%)", value: formatCurrency(breakdown.etf) },
      { label: "Loan Deduction", value: formatCurrency(breakdown.loan) },
      {
        label: "Other Deductions",
        value: formatCurrency(otherDeductions),
        helper: otherDeductions ? "Includes miscellaneous adjustments" : undefined,
      },
      { label: "Total Deductions", value: formatCurrency(totalDeductions) },
      { label: "Net Pay", value: formatCurrency(breakdown.net) },
    ];

    const earningsCardHeight = calculateListCardHeight(earningsItems);
    const deductionCardHeight = calculateListCardHeight(deductionItems);
    ensureSpace(Math.max(earningsCardHeight, deductionCardHeight) + 28);

    const earningsHeight = drawListCard(doc, {
      title: "Earnings",
      x: left,
      y: currentY,
      width: cardWidth,
      items: earningsItems,
    });

    const deductionsHeight = drawListCard(doc, {
      title: "Deductions",
      x: left + cardWidth + gap,
      y: currentY,
      width: cardWidth,
      items: deductionItems,
    });

    currentY += Math.max(earningsHeight, deductionsHeight) + 28;

    // Net pay highlight card
    const highlightHeight = 110;
    ensureSpace(highlightHeight + 60);
    doc.save();
    doc.roundedRect(left, currentY, pageWidth, highlightHeight, 18).fill("#047857");
    doc.restore();
    doc.save();
    doc.roundedRect(left, currentY, pageWidth, highlightHeight, 18).lineWidth(1).stroke("#065f46");
    doc.restore();

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("#d1fae5")
      .text("Amount Payable", left + 28, currentY + 24);

    doc
      .font("Helvetica-Bold")
      .fontSize(28)
      .fillColor("#ecfdf5")
      .text(formatCurrency(breakdown.net), left + 28, currentY + 48);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#bbf7d0")
      .text(
        `Gross ${formatCurrency(breakdown.gross)} · Total deductions ${formatCurrency(
          totalDeductions
        )}`,
        left + 28,
        currentY + 82
      );

    currentY += highlightHeight + 40;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#64748b")
      .text(
        "This document is generated electronically. Please contact HR at hr@teafactory.com for any clarifications.",
        left,
        currentY,
        {
          width: pageWidth,
          align: "center",
        }
      );

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
