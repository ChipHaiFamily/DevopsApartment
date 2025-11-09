import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generate and download a PDF report for the given month (English version)
 * @param {Object} report - Data returned from /dashboard/admin/report
 * @param {string} selectedMonth - e.g. "2025-11"
 */
export default function exportReportPDF(report, selectedMonth) {
  if (!report) return;

  const doc = new jsPDF();
  const date = new Date().toLocaleDateString("en-GB");

  // ===== Header Section =====
  doc.setFontSize(16);
  doc.text(`Monthly Report (${selectedMonth})`, 14, 20);

  doc.setFontSize(12);
  doc.text(`Occupancy Rate: ${report.occupancyRate?.toFixed(2) ?? 0}%`, 14, 30);
  doc.text(`Total Income: ${report.totalIncome ?? 0} THB`, 14, 38);
  doc.text(`Maintenance Cost: ${report.maintenanceCost ?? 0} THB`, 14, 46);
  doc.text(`Net Profit: ${report.profit ?? 0} THB`, 14, 54);

  // ===== Room Details Table =====
  autoTable(doc, {
    startY: 65,
    head: [["Room", "Tenant", "Status", "Water (unit)", "Electricity (unit)", "Maintenance Count"]],
    body:
      report.roomDetails && report.roomDetails.length > 0
        ? report.roomDetails.map((r) => [
            r.roomNum,
            r.tenantName || "-",
            r.status,
            r.waterUsage,
            r.electricityUsage,
            r.maintenanceCount,
          ])
        : [["No changes recorded", "", "", "", "", ""]],
  });

  // ===== Invoice Table =====
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Invoice ID", "Tenant", "Total (THB)", "Status"]],
    body:
      report.invoices && report.invoices.length > 0
        ? report.invoices.map((inv) => [
            inv.invoiceId,
            inv.tenant?.user?.fullName || "-",
            inv.totalAmount,
            inv.status,
          ])
        : [["No changes recorded", "", "", ""]],
  });

  // ===== Contract Table =====
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Room", "Tenant", "Status"]],
    body:
      report.contracts && report.contracts.length > 0
        ? report.contracts.map((c) => [
            c.room?.roomNum || "-",
            c.tenant?.user?.fullName || "-",
            c.status,
          ])
        : [["No changes recorded", "", ""]],
  });

  // ===== Maintenance Table =====
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Maintenance ID", "Room", "Status"]],
    body:
      report.maintenances && report.maintenances.length > 0
        ? report.maintenances.map((m) => [
            m.logId,
            m.room?.roomNum || "-",
            m.status,
          ])
        : [["No changes recorded", "", ""]],
  });

  // ===== Footer Section =====
  const footerY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.text(`Generated on ${date}`, 14, footerY);

  doc.save(`report_${selectedMonth}.pdf`);
}
