import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatCardBS from "../../components/admin/StatCardBS";
import RoomMapBS from "../../components/admin/RoomMapBS";
import ProgressBarBS from "../../components/admin/ProgressBarBS";
import MaintenanceListBS from "../../components/admin/MaintenanceListBS";
import OverdueListBS from "../../components/admin/OverdueListBS";
import SupplyListBS from "../../components/admin/SupplyListBS";
import MaintenanceScheduleBS from "../../components/admin/MaintenanceScheduleBS";
import api from "../../api/axiosConfig";

// ⬇️ เพิ่ม recharts สำหรับกราฟ
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function DashboardBS() {
  const navigate = useNavigate();

  // ---------- STATE หลัก ----------
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // คอนโทรลช่วงเวลา + ชั้น (ค่าเริ่มต้น: ม.ค. ของปีปัจจุบัน ถึง เดือนปัจจุบัน, ชั้น 1)
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [floor, setFloor] = useState(1);

  // ช่วยแปลงเลขเดือน -> YYYY-MM
  const ym = (y, m) => `${y}-${String(m).padStart(2, "0")}`;

  // ---------- ดึงข้อมูลจาก API ตามช่วงเวลา/ชั้น ----------
  useEffect(() => {
    const startYM = ym(year, startMonth);
    const endYM = ym(year, endMonth);
    setLoading(true);
    api
      .get(`/dashboard/admin`, {
        params: {
          startMonth: startYM,
          endMonth: endYM,
          floor,
        },
      })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
      })
      .finally(() => setLoading(false));
  }, [year, startMonth, endMonth, floor]);

  // ---------- รายชื่อเดือน (สำหรับแกน X และตัวเลือก) ----------
  const monthNames = [
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

  // ---------- เตรียมข้อมูลกราฟ จาก waterUsage / electricityUsage ----------
  // รูปแบบข้อมูลจาก API: { "YYYY-MM": number, ... }
  // เราจะเติมช่องว่างเดือนที่ไม่มีให้เป็น 0 (อ้างแนวคิดเดียวกับ RoomDetailBS)
  const chartData = useMemo(() => {
    if (!data) return [];
    const { waterUsage = {}, electricityUsage = {} } = data;

    const rows = [];
    for (let m = startMonth; m <= endMonth; m++) {
      const key = ym(year, m);
      rows.push({
        name: monthNames[m - 1],
        water: Number(waterUsage[key] ?? 0),
        electric: Number(electricityUsage[key] ?? 0),
        monthIndex: m,
      });
    }
    return rows;
  }, [data, startMonth, endMonth, year]);

  if (loading) return <div>กำลังโหลด...</div>;
  if (!data) return <div>ไม่พบข้อมูล</div>;

  const {
    totalRooms,
    rentedRooms,
    outstandingInvoices,
    openMaintenance,
    occupancyRate,
    monthlyRevenue,
    rooms,
    maintenanceTasks,
    outstandingInvoicesList,
  } = data;

  return (
    <div className="container py-3">
      {/* หัวข้อหน้า */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">แดชบอร์ดแอดมิน</h3>
          <p className="text-muted mb-0">ภาพรวมระบบจัดการอพาร์ตเมนต์</p>
        </div>
      </div>

      {/* เมทริก 4 ช่อง */}
      <div className="row g-3 mb-2">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ห้องพักทั้งหมด"
            value={totalRooms ?? 0}
            icon={<i className="bi bi-building"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ห้องที่ให้เช่า"
            value={rentedRooms ?? 0}
            icon={<i className="bi bi-key"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ใบแจ้งหนี้ค้างชำระ"
            value={outstandingInvoices ?? 0}
            icon={<i className="bi bi-receipt"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="งานซ่อมที่เปิดอยู่"
            value={openMaintenance ?? 0}
            icon={<i className="bi bi-tools"></i>}
          />
        </div>
      </div>

      <div className="row g-3">
        {/* แผนที่ห้อง */}
        <div className="col-lg-7">
          <div className="card card-soft">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <div className="fw-bold">แผนที่ห้อง</div>
              <a className="link-primary small" href="/admin/rooms">
                ดูทั้งหมด
              </a>
            </div>
            <div className="card-body pt-0 roommap-scroll">
              <RoomMapBS
                rooms={rooms ?? []}
                floors={[1, 2]}
                onRoomClick={(r) => navigate(`/admin/rooms/${r.roomNum}`)}
              />
            </div>
          </div>
        </div>

        {/* อัตราเข้าพัก + รายได้ */}
        <div className="col-lg-5">
          <div className="card card-soft mb-3">
            <div className="card-header bg-white border-0 fw-bold">
              อัตราการเข้าพัก
            </div>
            <div className="card-body">
              <div className="display-6 fw-bold text-primary">
                {Math.round(occupancyRate ?? 0)}%
              </div>
              <div className="text-secondary small mb-2">
                {rentedRooms ?? 0} จาก {totalRooms ?? 0}
              </div>
              <ProgressBarBS value={Math.round(occupancyRate ?? 0)} />
            </div>
          </div>

          <div className="card card-soft pb-5">
            <div className="card-header bg-white border-0 fw-bold">
              รายได้เดือนนี้
            </div>
            <div className="card-body">
              <div className="display-6 fw-bold text-success">
                ฿{(monthlyRevenue ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* ===== กราฟใช้น้ำ-ไฟฟ้า (ตามช่วงเวลา/ชั้น) ===== */}
        <div className="col-12">
          <div className="card card-soft">
            <div className="card-header bg-white border-0 fw-bold d-flex flex-wrap gap-2 align-items-center">
              <span>การใช้น้ำ-ไฟฟ้า</span>
              <div className="ms-auto d-flex flex-wrap gap-2 align-items-center">
                <label className="small fw-semibold me-1">ชั้น:</label>
                <select
                  className="form-select form-select-sm w-auto"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                <label className="small fw-semibold ms-2 me-1">ช่วง:</label>
                <select
                  className="form-select form-select-sm w-auto"
                  value={startMonth}
                  onChange={(e) => setStartMonth(Number(e.target.value))}
                >
                  {monthNames.map((m, i) => (
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
                  {monthNames.map((m, i) => (
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
                  {[year - 1, year, year + 1].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* กราฟไฟฟ้า */}
            <div className="card-body border-bottom" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="electric" fill="#fbc02d" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* กราฟน้ำ */}
            <div className="card-body" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="water" fill="#29b6f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* งานซ่อมบำรุง + ใบแจ้งหนี้ */}
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card card-soft">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <div className="fw-bold">งานซ่อมบำรุง</div>
                <a className="link-primary small" href="/admin/maintenance">
                  ดูทั้งหมด
                </a>
              </div>
              <div className="card-body pt-0">
                <MaintenanceListBS logs={maintenanceTasks ?? []} />
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card card-soft">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <div className="fw-bold">ใบแจ้งหนี้ค้างชำระ</div>
                <a className="link-primary small" href="/admin/invoices">
                  ดูทั้งหมด
                </a>
              </div>
              <div className="card-body pt-0">
                <OverdueListBS invoices={outstandingInvoicesList ?? []} />
              </div>
            </div>
          </div>
        </div>

        {/* ตารางซ่อมบำรุง + คลังสิ่งของ */}
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card card-soft">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <div className="fw-bold">ตารางซ่อมบำรุง</div>
                <a className="link-primary small" href="/admin/maintenance">
                  ดูทั้งหมด
                </a>
              </div>
              <div className="card-body pt-0">
                <MaintenanceScheduleBS
                  schedule={data.maintenanceSchedule ?? []}
                />
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card card-soft">
              <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                <div className="fw-bold">คลังสิ่งของ</div>
                <a className="link-primary small" href="/admin/supply">
                  ดูทั้งหมด
                </a>
              </div>
              <div className="card-body pt-0">
                <SupplyListBS items={data.supplyItems ?? []} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
