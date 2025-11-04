import React, { useState, useEffect } from "react";
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
import api from "../../api/axiosConfig";

export default function RoomDetailBS() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [year, setYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);

  /** ดึงข้อมูลจริงจาก API */
  useEffect(() => {
    const startYM = `${year}-${String(startMonth).padStart(2, "0")}`;
    const endYM = `${year}-${String(endMonth).padStart(2, "0")}`;

    api
      .get(`/dashboard/room/${roomId}?startMonth=${startYM}&endMonth=${endYM}`)
      .then((res) => {
        setRoomData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching room detail:", err);
        setLoading(false);
      });
  }, [roomId, startMonth, endMonth, year]);

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

  /** เตรียมข้อมูลกราฟจาก consumption */
  const chartData =
    roomData?.consumption?.map((item) => {
      const [y, m] = item.month.split("-");
      return {
        name: months[parseInt(m, 10) - 1],
        water: item.water,
        electric: item.electric,
        cost: item.total,
        year: parseInt(y, 10),
        monthIndex: parseInt(m, 10),
      };
    }) ?? [];

  const filledData = [];
  for (let m = startMonth; m <= endMonth; m++) {
    const existing = chartData.find(
      (d) => d.year === year && d.monthIndex === m
    );
    filledData.push(
      existing || {
        name: months[m - 1],
        water: 0,
        electric: 0,
        cost: 0,
        year,
        monthIndex: m,
      }
    );
  }

  /** filter ช่วงเดือน */
  const filtered = filledData;

  /**  แสดงระหว่างโหลด */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      {/* Section Header + Stats */}
      <div
        className="p-4 rounded mb-4"
        style={{
          backgroundImage: `url(${bgRoom})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-1">ห้องพักหมายเลข {roomId}</h4>
          <div>
            <button className="btn btn-light me-2" onClick={() => navigate(-1)}>
              กลับ
            </button>
            <button className="btn btn-primary">โปรไฟล์ผู้เช่า</button>
          </div>
        </div>
        <div className="mb-4">รายละเอียดภาพรวมของห้องพัก</div>

        {/* Summary Stat Cards */}
        <div className="row g-3 mb-4">
          {/* <div className="col-12 col-md-4">
            <StatCardBS
              label="ยอดค้างชำระ"
              value={`฿${(roomData?.totalUnpaid ?? 0).toLocaleString()}`}
              icon={<i className="bi bi-cash-stack text-danger"></i>}
            />
          </div>
          <div className="col-12 col-md-4">
            <StatCardBS
              label="คำขอรอการซ่อมแซม"
              value={`${roomData?.maintenanceCount ?? 0} รายการ`}
              icon={<i className="bi bi-tools text-warning"></i>}
            />
          </div> */}
          <div className="col-12 col-md-4">
            <StatCardBS
              label="พักอาศัยแล้ว"
              value={`${roomData?.daysStayed ?? 0} วัน`}
              icon={<i className="bi bi-calendar-check text-success"></i>}
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

      {/* Chart การใช้ไฟ */}
      <div className="card card-soft mb-3">
        <div className="card-header bg-white border-0 fw-bold">
          การใช้ไฟฟ้า(หน่วย)
        </div>
        <div className="card-body" style={{ height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="electric" fill="#fbc02d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart การใช้น้ำ */}
      <div className="card card-soft mb-3">
        <div className="card-header bg-white border-0 fw-bold">
          การใช้น้ำ(หน่วย)
        </div>
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
          ค่าใช้จ่ายรวม(บาท)
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
