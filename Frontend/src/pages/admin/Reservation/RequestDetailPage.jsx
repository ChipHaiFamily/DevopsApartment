import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// import roomsData from "../../data.json"; // ใช้ data.json ที่คุณมี (rooms / room_types)

const mockRequest = {
  id: "REQ-2025-0816-001",
  name: "ศุภภัทร กิสัญเพียร",
  gender: "ชาย",
  submitted_at: "2025-08-16 17:35",
  email: "email@example.com",
  phone: "089-123-4567",
  occupation: "นักศึกษา",
  workplace: "คณะ ICT มหิดล",
  id_card: "12345xxxxxxxx",
  emergency_contact: "นางสาว เสี่ยวหมิง เจียง",
  relation: "น้องสาว",
  emergency_phone: "089-113-4567",
  request_detail: "อยากได้ห้องชั้น 2 ติดทางขึ้น\nไม่โดนแดด ",
  priority: "สูง", // โชว์ badge มุมขวาบน
};

function Line({ label, value }) {
  return (
    <div className="d-flex">
      <div className="text-secondary me-2" style={{ minWidth: 110 }}>
        {label}:
      </div>
      <div className="fw-semibold">{value || "-"}</div>
    </div>
  );
}

/** Modal ยืนยันผล */
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  variant = "primary",
  confirmText = "ยืนยัน",
  reservation,
}) {
  if (!open) return null;

  const user = reservation.user;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content"
            style={{ fontFamily: "Kanit, system-ui, sans-serif" }}
          >
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{title}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="alert alert-light border">
                <div className="fw-semibold mb-2">
                  {user.fullName} ({user.sex})
                </div>
                <Line label="เลขที่คำขอ" value={reservation.reservationNum} />
                <Line label="วันที่จอง" value={reservation.dateTime} />
                <Line label="อีเมล" value={user.email} />
                <Line label="เบอร์โทร" value={user.tel} />
                <Line label="อาชีพ" value={user.job} />
                <Line label="ที่ทำงาน" value={user.workplace} />
                <Line label="สถานะ" value={reservation.status} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button className={`btn btn-${variant}`} onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** toast สำเร็จ */
function SmallResult({
  open,
  onClose,
  title = "ทำรายการสำเร็จ",
  caption = "",
}) {
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content text-center p-4">
            <div className="display-6 mb-2">✅</div>
            <h5 className="fw-bold mb-1">{title}</h5>
            <div className="text-secondary mb-3">{caption}</div>
            <button className="btn btn-primary" onClick={onClose}>
              รับทราบ
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** หน้าแสดงคำขอ + เลือกห้องว่าง + อนุมัติ/ปฏิเสธ */
export default function RequestDetailPage() {
  const { id } = useParams(); // รับ reservationNum
  const [reservation, setReservation] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  // modal states
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [doneMsg, setDoneMsg] = useState({ title: "", caption: "" });

  // โหลดข้อมูล reservation
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${baseURL}/reservations`);
        const found = res.data.find((r) => r.reservationNum === id);
        setReservation(found || null);
      } catch (err) {
        console.error("Error fetching reservation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, baseURL]);

  // โหลดข้อมูล rooms
  // โหลดข้อมูล rooms
  // โหลดข้อมูล rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${baseURL}/rooms`);
        const allRooms = res.data.data || [];

        // กรองห้องว่างที่ตรงกับประเภทที่ผู้จองเลือก
        const matchedRooms = allRooms.filter(
          (r) =>
            r.status === "available" &&
            r.roomTypeName === reservation?.roomType?.name
        );

        setRooms(matchedRooms);
      } catch (err) {
        console.error("Error fetching rooms:", err);
      }
    };
    // รอให้ reservation โหลดมาก่อนแล้วค่อย fetch
    if (reservation) fetchRooms();
  }, [baseURL, reservation]);

  if (loading) return <div className="p-3">กำลังโหลด...</div>;
  if (!reservation) return <div className="p-3">ไม่พบคำขอ {id}</div>;

  const user = reservation.user;

  const handleApprove = () => {
    if (!selectedRoom) {
      alert("โปรดเลือกห้องว่างก่อนอนุมัติ");
      return;
    }
    setApproveOpen(true);
  };
  // RequestDetailPage.jsx

  const onApproveConfirm = async () => {
    setApproveOpen(false);
    try {
      await axios.put(`${baseURL}/reservations/${reservation.reservationNum}`, {
        reservationNum: reservation.reservationNum,
        dateTime: reservation.dateTime, // ใช้ค่าเดิมที่ได้จาก reservation
        assignedRoom: selectedRoom.roomNum, // ห้องที่เลือก
        user: {
          id: reservation.user.id,
        },
        roomType: {
          roomTypeId: reservation.roomType.roomTypeId,
        },
      });

      setDoneMsg({
        title: "ทำรายการสำเร็จ",
        caption: `อนุมัติห้อง ${selectedRoom.roomNum} แล้ว`,
      });
      setDoneOpen(true);
    } catch (err) {
      console.error("Error approving reservation:", err);
      alert("เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  const handleReject = () => setRejectOpen(true);
  const onRejectConfirm = async () => {
    setRejectOpen(false);

    try {
      await axios.put(`${baseURL}/reservations/${reservation.reservationNum}`, {
        reservationNum: reservation.reservationNum,
        eservationNum: reservation.reservationNum,
        dateTime: reservation.dateTime,
        user: {
          id: reservation.user.id,
        },
        roomType: {
          roomTypeId: reservation.roomType.roomTypeId,
        },
        status: "rejected",
      });

      setDoneMsg({ title: "ปฏิเสธคำขอสำเร็จ", caption: "ปฏิเสธคำขอเรียบร้อย" });
      setDoneOpen(true);
    } catch (err) {
      console.error("Error rejecting reservation:", err);
      alert("เกิดข้อผิดพลาดในการปฏิเสธ");
    }
  };

  return (
    <div
      className="container py-3"
      style={{ fontFamily: "Kanit, system-ui, sans-serif" }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="fw-bold mb-0">รายละเอียดคำขอ</h4>
        <div className="text-secondary">
          หมายเลขคำขอ: {reservation.reservationNum}
        </div>
      </div>

      <div className="row g-3">
        {/* ซ้าย: รายละเอียดผู้ขอ */}
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-light border"
                    style={{ width: 46, height: 46 }}
                  />
                  <div>
                    <div className="fw-bold">{user.fullName}</div>
                    <div className="text-secondary small">{user.sex}</div>
                  </div>
                </div>
                {/* <Pill color="warning"> {mockRequest.priority} </Pill> */}
              </div>

              <div className="border rounded p-3">
                <Line label="วันที่ยื่นคำขอ" value={reservation.dateTime} />
                <Line label="อีเมล" value={user.email} />
                <Line label="เบอร์" value={user.tel} />
                <Line label="อาชีพ" value={user.job} />
                <Line label="ที่ทำงาน" value={user.workplace} />
              </div>

              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-danger flex-fill"
                  onClick={handleReject}
                >
                  ปฏิเสธ
                </button>
                <button
                  className="btn btn-primary flex-fill"
                  onClick={handleApprove}
                >
                  อนุมัติ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ขวา: เลือกห้องว่าง */}
        <div className="col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="fw-bold mb-0">เลือกห้องให้คำขอนี้</h6>
                <div className="text-secondary small">
                  ห้องว่าง {rooms.length} ห้อง
                </div>
              </div>

              {/* Dropdown เลือกห้อง */}
              <div className="mt-3">
                <label className="form-label">เลือกห้องว่าง</label>
                <select
                  className="form-select"
                  value={selectedRoom?.roomNum || ""}
                  onChange={(e) => {
                    const r = rooms.find((x) => x.roomNum === e.target.value);
                    setSelectedRoom(r || null);
                  }}
                >
                  <option value="">-- โปรดเลือก --</option>
                  {rooms.map((r) => (
                    <option key={r.roomNum} value={r.roomNum}>
                      ชั้น {r.floor} | ห้อง {r.roomNum} ({r.roomTypeName})
                    </option>
                  ))}
                </select>
              </div>

              {/* การ์ดสรุปห้องที่เลือก */}
              {selectedRoom && (
                <div className="border rounded p-3 mt-3">
                  <div className="fw-bold mb-1">
                    ห้อง {selectedRoom.roomNum}
                  </div>
                  <div className="text-secondary small">
                    ชั้น {selectedRoom.floor}
                  </div>
                  <div className="mt-2">
                    <div className="text-secondary">ประเภทห้อง</div>
                    <div className="fw-semibold">
                      {selectedRoom.roomTypeName}
                    </div>
                  </div>
                  {selectedRoom?.price != null && (
                    <div className="mt-2">
                      <div className="text-secondary">ค่าเช่าต่อเดือน</div>
                      <div className="fw-semibold text-primary">
                        ฿{selectedRoom.price.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grid ห้องว่างให้คลิกเลือกได้เร็ว */}
              <div className="mt-3">
                <div className="text-secondary small mb-2">
                  หรือเลือกจากรายการด้านล่าง
                </div>
                <div className="row g-2">
                  {rooms.map((r) => (
                    <div className="col-6" key={r.roomNum}>
                      <button
                        onClick={() => setSelectedRoom(r)}
                        className={`w-100 btn btn-sm ${
                          selectedRoom?.roomNum === r.roomNum
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                      >
                        ชั้น {r.floor} • {r.roomNum}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal อนุมัติ */}
      <ConfirmModal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={onApproveConfirm}
        title={`อนุมัติคำขอ (ห้อง ${selectedRoom?.roomNum || "-"})`}
        variant="primary"
        confirmText="ยืนยัน"
        reservation={reservation}
      />

      {/* Modal ปฏิเสธ */}
      <ConfirmModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={onRejectConfirm}
        title="ปฏิเสธคำขอ"
        variant="danger"
        confirmText="ปฏิเสธ"
        reservation={reservation}
      />

      {/* กล่องแจ้งผลสำเร็จ */}
      <SmallResult
        open={doneOpen}
        onClose={() => setDoneOpen(false)}
        title={doneMsg.title}
        caption={doneMsg.caption}
      />
    </div>
  );
}
