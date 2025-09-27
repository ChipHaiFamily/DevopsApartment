import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCardBS from "../../components/admin/StatCardBS";
import bgRoom from "../../assets/roomDetailBG.jpg";
import tenantData from "../../data/tenantData.json";

export default function TenantOverviewPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  // เอาข้อมูลจาก tenantData ตาม roomId
  const data = tenantData[roomId];

  if (!data) {
    return (
      <div className="container py-5">
        <h4 className="text-danger">ไม่พบข้อมูลของห้อง {roomId}</h4>
      </div>
    );
  }

  const { totalPaid, maintCount, stayDays, costs } = data;

  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  // state สำหรับ filter ช่วงเวลา
  const [startMonth, setStartMonth] = useState(1); // มกราคม
  const [endMonth, setEndMonth] = useState(6); // มิถุนายน
  const [year, setYear] = useState(2025);

  // filter ข้อมูล
  const filtered = costs.filter(
    (d) =>
      d.year === year && d.monthIndex >= startMonth && d.monthIndex <= endMonth
  );

  return (
    <div className="container py-3">
      {/* Section Header + Stats */}
      <div
        className="p-4 rounded mb-4"
        style={{
          backgroundImage: `url(${bgRoom})`, // ใส่ path ของรูปคุณ
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        {/* Header */}
        <h4 className="fw-bold mb-1">ห้องพักหมายเลข {roomId}</h4>

        <div className="mb-4">รายละเอียดภาพรวมของห้องพัก</div>

        {/* สรุป Stat Cards */}
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <StatCardBS
              label="ยอดค้างชำระ"
              value={`฿${totalPaid.toLocaleString()}`}
              icon={<i className="bi bi-cash-stack"></i>}
            />
          </div>
          <div className="col-12 col-md-4">
            <StatCardBS
              label="คำขอรอการซ่อมแซม"
              value={`${maintCount} รายการ`}
              icon={<i className="bi bi-tools"></i>}
            />
          </div>
          <div className="col-12 col-md-4">
            <StatCardBS
              label="พักอาศัยแล้ว"
              value={`${stayDays} วัน`}
              icon={<i className="bi bi-calendar-check"></i>}
            />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card mb-4">
        <div className="card-body d-flex flex-wrap gap-2 align-items-center">
          <label className="fw-bold small me-2">เลือกช่วงเวลา:</label>
          <select
            className="form-select form-select-sm w-auto"
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <span className="mx-1">ถึง</span>
          <select
            className="form-select form-select-sm w-auto"
            value={endMonth}
            onChange={(e) => setEndMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            className="form-select form-select-sm w-auto ms-2"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart ค่าไฟ */}
      <div className="card card-soft mb-3">
        <div className="card-header bg-white border-0 fw-bold">การใช้ไฟ</div>
        <div className="card-body" style={{ height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#fbc02d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart ค่าน้ำ */}
      <div className="card card-soft mb-3">
        <div className="card-header bg-white border-0 fw-bold">การใช้น้ำ</div>
        <div className="card-body" style={{ height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="water" fill="#29b6f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart ค่าใช้จ่ายรวม */}
      <div className="card card-soft">
        <div className="card-header bg-white border-0 fw-bold">
          ค่าใช้จ่ายรวม
        </div>
        <div className="card-body" style={{ height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cost" fill="#43a047" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
