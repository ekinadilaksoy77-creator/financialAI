import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function exportPDF(expenses, savedIncome, categoryGoals, userName) {
  const doc = new jsPDF();
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = savedIncome - totalExpenses;
  const date = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // ── Header ──
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, 210, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SpendSmart", 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text(`Monthly Expense Report — ${date}`, 14, 25);
  doc.text(`Prepared for: ${userName || "User"}`, 14, 32);

  // ── Divider ──
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, 44, 196, 44);

  // ── Summary ──
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Financial Summary", 14, 52);

  autoTable(doc, {
    startY: 56,
    head: [["Description", "Amount"]],
    body: [
      ["Monthly Income", `$${Number(savedIncome).toFixed(2)}`],
      ["Total Expenses", `$${Number(totalExpenses).toFixed(2)}`],
      ["Remaining Budget", `$${Number(remaining).toFixed(2)}`],
      ["Budget Used", savedIncome > 0 ? `${((totalExpenses / savedIncome) * 100).toFixed(1)}%` : "0%"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [40, 40, 40],
      fontSize: 10,
    },
    alternateRowStyles: { fillColor: [247, 247, 247] },
    margin: { left: 14, right: 14 },
  });

  // ── Spending by Category ──
  const CATEGORIES = ["Food", "Rent", "Transport", "Entertainment", "Health", "Shopping", "Utilities", "Other"];
  const byCategory = CATEGORIES.map(c => ({
    name: c,
    total: expenses.filter(e => e.category === c).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0);

  if (byCategory.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Spending by Category", 14, doc.lastAutoTable.finalY + 14);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [["Category", "Amount Spent", "Budget Goal", "Status"]],
      body: byCategory.map(c => {
        const goal = categoryGoals[c.name] || 0;
        const over = goal > 0 && c.total > goal;
        return [
          c.name,
          `$${c.total.toFixed(2)}`,
          goal > 0 ? `$${goal.toFixed(2)}` : "No limit",
          over ? "Over Budget" : "On Track"
        ];
      }),
      theme: "grid",
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [40, 40, 40],
        fontSize: 10,
      },
      alternateRowStyles: { fillColor: [247, 247, 247] },
      columnStyles: {
        3: {
          fontStyle: "bold",
        }
      },
      didParseCell: (data) => {
        if (data.column.index === 3 && data.cell.raw === "Over Budget") {
          data.cell.styles.textColor = [180, 0, 0];
        }
        if (data.column.index === 3 && data.cell.raw === "On Track") {
          data.cell.styles.textColor = [0, 140, 0];
        }
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ── All Expenses ──
  if (expenses.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("All Expenses", 14, doc.lastAutoTable.finalY + 14);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 18,
      head: [["Date", "Description", "Category", "Amount"]],
      body: [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(e => [
          e.date,
          e.name,
          e.category,
          `$${Number(e.amount).toFixed(2)}`
        ]),
      theme: "grid",
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: [40, 40, 40],
        fontSize: 10,
      },
      alternateRowStyles: { fillColor: [247, 247, 247] },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, 284, 196, 284);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(`SpendSmart Monthly Report — ${date}`, 14, 289);
    doc.text(`Page ${i} of ${pageCount}`, 180, 289);
  }

  doc.save(`SpendSmart-Report-${date.replace(" ", "-")}.pdf`);
}