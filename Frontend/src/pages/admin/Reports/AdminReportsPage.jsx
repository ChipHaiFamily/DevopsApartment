import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import StatCardBS from "../../../components/admin/StatCardBS";
import ProgressBarBS from "../../../components/admin/ProgressBarBS";
import MaintenanceListBS from "../../../components/admin/MaintenanceListBS";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [report, setReport] = useState(null);

  // ==== ตั้งค่า default เป็นเดือนปัจจุบัน ====
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${y}-${m}`);
  }, []);

  // ==== โหลดข้อมูลจาก API ====
  useEffect(() => {
    if (!selectedMonth) return;
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${baseURL}/dashboard/admin/report?month=${selectedMonth}`
        );
        setReport(res.data);
      } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว:", err);
      }
    };
    fetchData();
  }, [selectedMonth]);

  const exportCSV = () => {
    if (!report) return;
    let csv = "ประเภท,จำนวน,เข้าพัก,อัตรา\n";
    report.roomEfficiency.forEach((r) => {
      csv += `${r.type},${r.total},${r.occupied},${r.rate}%\n`;
    });
    csv += "\nเดือน,รายได้\n";
    report.monthlyRevenue.forEach((r) => {
      csv += `${r.month},${r.revenue}\n`;
    });

    // ใส่ BOM "\ufeff" เพื่อบอก Excel ว่าเป็น UTF-8
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Report for ${selectedMonth}`, 14, 20);

    doc.setFontSize(12);
    doc.text(`Occupancy Rate: ${report.summary.occupancyRate}%`, 14, 30);
    doc.text(`Total Revenue: ${report.summary.totalRevenue} THB`, 14, 38);
    doc.text(`Maintenance Cost: ${report.summary.maintenanceCost} THB`, 14, 46);
    doc.text(`Net Profit: ${report.summary.netProfit} THB`, 14, 54);

    // Room Efficiency Table
    autoTable(doc, {
      startY: 65,
      head: [["Room Type", "Total", "Occupied", "Rate"]],
      body: report.roomEfficiency.map((r) => [
        r.type,
        r.total,
        r.occupied,
        `${r.rate}%`,
      ]),
    });

    // Monthly Revenue Table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Month", "Revenue (THB)"]],
      body: report.monthlyRevenue.map((r) => [r.month, r.revenue]),
    });

    doc.save(`report_${selectedMonth}.pdf`);
  };

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-1">รายงาน</h4>
          <div className="text-secondary small">รายงานและสถิติการดำเนินงาน</div>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-light text-primary me-2"
            onClick={exportCSV}
          >
            ส่งออก CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={exportPDF}>
            ส่งออก PDF
          </button>
        </div>
      </div>

      {/* Month Picker */}
      <div className="mb-3">
        <label className="form-label small fw-bold me-2">เลือกช่วงเวลา</label>
        <input
          type="month"
          className="form-control w-auto d-inline-block"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          min="2024-01"
        />
      </div>

      {report ? (
        <>
          {/* Stat Cards */}
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6 col-lg-3">
              <StatCardBS
                label="อัตราการเข้าพัก"
                value={`${report.summary.occupancyRate}%`}
                icon={<i className="bi bi-bar-chart"></i>}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <StatCardBS
                label="รายได้รวม"
                value={`฿${report.summary.totalRevenue.toLocaleString()}`}
                icon={<i className="bi bi-cash-stack text-success"></i>}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <StatCardBS
                label="ค่าส่วนบำรุง"
                value={`฿${report.summary.maintenanceCost}`}
                icon={<i className="bi bi-wrench-adjustable text-danger"></i>}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <StatCardBS
                label="กำไรสุทธิ"
                value={`฿${report.summary.netProfit}`}
                icon={<i className="bi bi-graph-up-arrow text-warning"></i>}
              />
            </div>
          </div>

          {/* รายได้ / เข้าพัก */}
          <div className="row g-3 mb-3">
            <div className="col-lg-6">
              <div className="card card-soft">
                <div className="card-header bg-white border-0 fw-bold">
                  รายได้
                </div>
                <div className="card-body">
                  {report.monthlyRevenue
                    .slice()
                    .reverse() // เรียงใหม่: เดือนล่าสุด -> ย้อนหลัง
                    .map((r) => (
                      <div
                        key={r.month}
                        className="d-flex justify-content-between mb-2"
                      >
                        <span>{r.month}</span>
                        <span className="fw-bold">฿{r.revenue}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card card-soft">
                <div className="card-header bg-white border-0 fw-bold">
                  อัตราการเข้าพัก
                </div>
                <div className="card-body">
                  {report.monthlyOccupancy
                    .slice()
                    .reverse() // เรียงใหม่
                    .map((o) => (
                      <div key={o.month} className="mb-2">
                        <div className="d-flex justify-content-between small">
                          <span>{o.month}</span>
                          <span>{o.occupancyRate}%</span>
                        </div>
                        <ProgressBarBS value={o.occupancyRate} />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* ประสิทธิภาพห้องพัก */}
          <div className="row g-3">
            <div className="col-lg-6">
              <div className="card card-soft">
                <div className="card-header bg-white border-0 fw-bold">
                  ประสิทธิภาพห้องพัก
                </div>
                <div className="card-body">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>ประเภท</th>
                        <th>จำนวน</th>
                        <th>เข้าพัก</th>
                        <th>อัตรา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.roomEfficiency.map((r, idx) => (
                        <tr key={idx}>
                          <td>{r.type}</td>
                          <td>{r.total}</td>
                          <td>{r.occupied}</td>
                          <td>{r.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* งานซ่อม */}
            <div className="col-lg-6">
              <div className="card card-soft">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                  <div className="fw-bold">งานซ่อมบำรุง</div>
                </div>
                <div className="card-body pt-0">
                  <MaintenanceListBS logs={report.maintenanceWorks} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>กำลังโหลดข้อมูล...</div>
      )}
    </div>
  );
}
