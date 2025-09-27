import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import data from "../../data.json";
import StatCardBS from "../../components/admin/StatCardBS";
import RoomMapBS from "../../components/admin/RoomMapBS";
import ProgressBarBS from "../../components/admin/ProgressBarBS";
import MaintenanceListBS from "../../components/admin/MaintenanceListBS";
import OverdueListBS from "../../components/admin/OverdueListBS";
import QuickMenuBS from "../../components/admin/QuickMenuBS";

export default function DashboardBS() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  // console.log("Calling API:", `${baseURL}/dashboard/admin`);

  useEffect(() => {
    axios
      .get(`${baseURL}/dashboard/admin`)
      .then((res) => {
        setData(res.data);
        setLoading(false);
        // console.log("Dashboard data:", res.data);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
      });
  }, [baseURL]);

  const navigate = useNavigate();

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">แดชบอร์ดแอดมิน</h3>
          <p className="text-muted mb-0">
            ภาพรวมระบบจัดการอพาร์ทเมนท์
          </p>
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
                {" "}
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

        {/* งานซ่อมบำรุง */}
        <div className="col-lg-7">
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

        {/* ใบแจ้งหนี้ค้างชำระ */}
        <div className="col-lg-5">
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
    </div>
  );
}
