import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../../api/axiosConfig";
import StatCardBS from "../../../components/admin/StatCardBS";
import exportReportPDF from "./exportReportPDF";

export default function AdminReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // ตั้งค่า default เป็นเดือนปัจจุบัน
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${y}-${m}`);
  }, []);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    if (!selectedMonth) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/dashboard/admin/report?month=${selectedMonth}`
        );
        setReport(res.data);
      } catch (err) {
        console.error("โหลดข้อมูลรายงานล้มเหลว:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">รายงาน</h3>
          <p className="text-muted mb-0">รายงานและสถิติการดำเนินงาน</p>
        </div>
        <div>
          {/* <button
            type="button"
            className="btn btn-light text-primary me-2"
            onClick={exportCSV}
            disabled={loading}
          >
            ส่งออก CSV
          </button> */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => exportReportPDF(report, selectedMonth)}
            disabled={loading}
          >
            ส่งออก PDF
          </button>
        </div>
      </div>

      {/* Month Picker */}
      <div className="mb-4">
        <label className="form-label small fw-bold me-2">เลือกช่วงเวลา</label>
        <input
          type="month"
          className="form-control w-auto d-inline-block"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          min="2024-01"
        />
      </div>

      {loading ? (
        <div>กำลังโหลดข้อมูล...</div>
      ) : !report ? (
        <div className="text-muted">ไม่พบข้อมูล</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <StatCardBS
                icon={<i className="bi bi-people-fill text-primary fs-3"></i>}
                label="อัตราการเข้าพัก"
                value={`${report.occupancyRate.toFixed(2)}%`}
              />
            </div>
            <div className="col-md-3">
              <StatCardBS
                icon={<i className="bi bi-cash-stack text-success fs-3"></i>}
                label="รายได้รวม"
                value={`฿${report.totalIncome.toLocaleString()}`}
              />
            </div>
            <div className="col-md-3">
              <StatCardBS
                icon={<i className="bi bi-tools text-danger fs-3"></i>}
                label="ค่าซ่อมบำรุง"
                value={`฿${report.maintenanceCost.toLocaleString()}`}
              />
            </div>
            <div className="col-md-3">
              <StatCardBS
                icon={
                  <i className="bi bi-graph-up-arrow text-warning fs-3"></i>
                }
                label="กำไรสุทธิ"
                value={`฿${report.profit.toLocaleString()}`}
              />
            </div>
          </div>

          {/* ตารางข้อมูลห้องพัก */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-white fw-bold">ข้อมูลห้องพัก</div>
            <div className="card-body p-0">
              {report.roomDetails.length === 0 ? (
                <div className="p-3 text-muted">ไม่มีข้อมูลห้องพัก</div>
              ) : (
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>ห้องพัก</th>
                      <th>ผู้เช่า</th>
                      <th>สถานะ</th>
                      <th>ใช้น้ำ (หน่วย)</th>
                      <th>ใช้ไฟฟ้า (หน่วย)</th>
                      <th>จำนวนงานซ่อม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.roomDetails.map((r, i) => (
                      <tr key={i}>
                        <td>{r.roomNum}</td>
                        <td>{r.tenantName || "-"}</td>
                        <td className="text-capitalize">{r.status}</td>
                        <td>{r.waterUsage}</td>
                        <td>{r.electricityUsage}</td>
                        <td>{r.maintenanceCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* ใบแจ้งหนี้ */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-white fw-bold">ใบแจ้งหนี้</div>
            <div className="card-body p-0">
              {report.invoices.length === 0 ? (
                <div className="p-3 text-muted">ไม่มีข้อมูลใบแจ้งหนี้</div>
              ) : (
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>หมายเลข</th>
                      <th>ผู้เช่า</th>
                      <th>ยอดชำระ (บาท)</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.invoices.map((inv, i) => (
                      <tr key={i}>
                        <td>{inv.invoiceId}</td>
                        <td>{inv.tenant.user.fullName}</td>
                        <td>{inv.totalAmount}</td>
                        <td>{inv.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* สัญญา & งานซ่อม */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">สัญญาเช่า</div>
                <div className="card-body p-0">
                  {report.contracts.length === 0 ? (
                    <div className="p-3 text-muted">ไม่มีข้อมูลสัญญาเช่า</div>
                  ) : (
                    <table className="table mb-0">
                      <thead>
                        <tr>
                          <th>ห้องพัก</th>
                          <th>ผู้เช่า</th>
                          <th>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.contracts.map((c, i) => (
                          <tr key={i}>
                            <td>{c.room.roomNum}</td>
                            <td>{c.tenant.user.fullName}</td>
                            <td>{c.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-white fw-bold">งานซ่อมบำรุง</div>
                <div className="card-body p-0">
                  {report.maintenances.length === 0 ? (
                    <div className="p-3 text-muted">ไม่มีข้อมูลงานซ่อม</div>
                  ) : (
                    <table className="table  mb-0">
                      <thead>
                        <tr>
                          <th>รหัสงาน</th>
                          <th>ห้องพัก</th>
                          <th>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.maintenances.map((m, i) => (
                          <tr key={i}>
                            <td>{m.logId}</td>
                            <td>{m.room.roomNum}</td>
                            <td>{m.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
