import React, { useEffect, useState } from "react";
import axios from "axios";
// import data from "../../data.json";
import StatCardBS from "../../../components/admin/StatCardBS";
import TableBS from "../../../components/admin/TableBS";
import RequestDetailModal from "./RequestDetailModal";
import { useNavigate } from "react-router-dom";

const formatDateTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function RequestPage() {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const navigate = useNavigate(); // สำหรับเปลี่ยนหน้า รับค่ามาจาก react-router-dom

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get(`${baseURL}/reservations`);
        setReservations(res.data);
      } catch (err) {
        console.error("Error fetching reservations:", err);
      }
    };
    fetchReservations();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${baseURL}/rooms`);
        setRooms(res.data.data || []);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };
    fetchRooms();
  }, [baseURL]);

  const waitingRequests = reservations.filter(
    (r) => r.status === "pending"
  ).length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;

  const columns = [
    { key: "id", label: "เลขที่คำขอ" },
    { key: "dateTime", label: "วันที่จอง" },
    { key: "fullName", label: "ชื่อผู้จอง" },
    { key: "email", label: "อีเมล" },
    { key: "tel", label: "เบอร์" },
    { key: "roomType", label: "ประเภทห้อง" },
    { key: "status", label: "สถานะ" },
    { key: "assignedRoom", label: "ห้องที่จอง" },
  ];

  const normalized = reservations.map((r) => ({
    id: r.reservationNum,
    dateTime: new Date(r.dateTime).toLocaleString("th-TH"),
    fullName: r.user?.fullName || "-",
    email: r.user?.email || "-",
    tel: r.user?.tel || "-",
    roomType: r.roomType?.name || "-",
    status: r.status,
    assignedRoom: r.assignedRoom || "-",
  }));

  const filters = [
    {
      key: "roomType",
      label: "ทุกประเภท",
      options: [
        { value: "Standard Studio", label: "Standard Studio" },
        { value: "Deluxe Studio", label: "Deluxe Studio" },
        { value: "Superior Studio", label: "Superior Studio" },
      ],
    },

    {
      key: "status",
      label: "ทุกสถานะ",
      options: [
        { value: "pending", label: "รออนุมัติ" },
        { value: "processing", label: "อนุมัติ" },
        { value: "rejected", label: "ปฏิเสธ" },
        { value: "accepted", label: "ทำสัญญาแล้ว" },
        { value: "no_show", label: "ไม่มาทำสัญญา" },
      ],
    },
  ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">คำขอจองห้องเช่า</h3>
          <p className="text-muted mb-0">จัดการรายการคำขอเช่า</p>
        </div>
      </div>

      {/* metric cards */}
      <div className="row g-3 mb-2">
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="คำขอรออนุมัติ"
            value={waitingRequests}
            icon={<i className="bi bi-check2-square text-warning" />}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="ห้องพร้อมให้เช่า"
            value={availableRooms}
            icon={<i className="bi bi-door-open-fill text-success" />}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="ห้องที่ไม่ว่าง"
            value={occupiedRooms}
            icon={<i className="bi bi-door-closed-fill" />}
          />
        </div>
      </div>

      {/* table */}
      <div className="card shadow-sm">
        <div className="card-header no-bg bg-light d-flex justify-content-between align-items-center p-3">
          <span className="fw-bold">คำขอจองห้องเช่า</span>
        </div>

        <div className="card-body">
          <TableBS
            columns={columns}
            data={normalized}
            filters={filters}
            cyname="cy_request_table"
            // NOTE: TableBS ส่งพารามิเตอร์ (key, value) หรือ (key, value, row)
            renderCell={(key, value, row) => {
              if (key === "submitted_at") return formatDateTime(value);
              if (key === "status") {
                return value === "accepted" ? (
                  <span className="badge bg-info">ทำสัญญาแล้ว</span>
                ) : value === "rejected" ? (
                  <span className="badge bg-danger">ปฏิเสธ</span>
                ) : value === "pending" ? (
                  <span className="badge bg-warning">รออนุมัติ</span>
                ) : value === "processing" ? (
                  <span className="badge bg-success">อนุมัติ</span>
                ) : value === "no_show" ? (
                  <span className="badge bg-secondary">ไม่มาทำสัญญา</span>
                ) : (
                  <span className="badge">???</span>
                );
              }
              return value;
            }}
            renderActions={(row) =>
              row.status === "pending" ? (
                <button
                  className="btn btn-sm"
                  onClick={() => navigate(`/admin/requests/${row.id}`)}
                >
                  <i className="bi bi-search" />
                </button>
              ) : (
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    const found = reservations.find(
                      (r) => r.reservationNum === row.id
                    );
                    setSelectedReservation(found);
                    setDetailOpen(true);
                  }}
                >
                  <i className="bi bi-search" />
                </button>
              )
            }
          />
        </div>
        <RequestDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          reservation={selectedReservation}
          onUpdated={() => {
            // reload reservations หลังแก้ไขเสร็จ
            axios
              .get(`${baseURL}/reservations`)
              .then((res) => setReservations(res.data));
          }}
        />
      </div>
    </div>
  );
}
