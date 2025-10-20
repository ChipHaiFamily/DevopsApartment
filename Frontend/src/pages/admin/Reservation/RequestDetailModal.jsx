import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RequestDetailModal({
  open,
  onClose,
  reservation,
  onUpdated,
}) {
  const [status, setStatus] = useState("");

  // เมื่อ reservation เปลี่ยน → sync ค่า status เข้า state
  useEffect(() => {
    if (reservation) {
      setStatus(reservation.status);
    }
  }, [reservation]);

  if (!open || !reservation) return null;

  const handleSave = async () => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/reservations/${
          reservation.reservationNum
        }`,
        {
          reservationNum: reservation.reservationNum,
          dateTime: reservation.dateTime,
          status,
          user: { id: reservation.user.id },
          roomType: { roomTypeId: reservation.roomType.roomTypeId },
        }
      );
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error("Error updating reservation:", err);
      alert("อัปเดตไม่สำเร็จ");
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content"
            style={{ fontFamily: "Kanit, system-ui, sans-serif" }}
          >
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">รายละเอียดการจอง</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">เลขที่การจอง</label>
                  <input
                    className="form-control"
                    value={reservation.reservationNum}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">วันที่จอง</label>
                  <input
                    className="form-control"
                    value={reservation.dateTime}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">ผู้จอง</label>
                  <input
                    className="form-control"
                    value={reservation.user?.fullName || "-"}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">เพศ</label>
                  <input
                    className="form-control"
                    value={reservation.user?.sex || "-"}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">อีเมล</label>
                  <input
                    className="form-control"
                    value={reservation.user?.email || "-"}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">เบอร์โทร</label>
                  <input
                    className="form-control"
                    value={reservation.user?.tel || "-"}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">อาชีพ</label>
                  <input
                    className="form-control"
                    value={reservation.user?.job || "-"}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ที่ทำงาน</label>
                  <input
                    className="form-control"
                    value={reservation.user?.workplace || "-"}
                    readOnly
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">ประเภทห้อง</label>
                  <input
                    className="form-control"
                    value={reservation.roomType?.name || "-"}
                    readOnly
                  />
                </div>

                {/* เลือกสถานะได้ถ้าไม่ใช่ accepted */}
                <div className="col-md-6">
                  <label className="form-label">สถานะ</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {/* แสดงค่าเดิมเสมอ แม้จะเป็น accepted/rejected */}
                    <option value={status}>
                      {status === "accepted"
                        ? "อนุมัติ"
                        : status === "rejected"
                        ? "ปฏิเสธ"
                        : status === "pending"
                        ? "รออนุมัติ"
                        : status === "processing"
                        ? "ทำสัญญาแล้ว"
                        : status === "no_show"
                        ? "ไม่มาทำสัญญา"
                        : status}
                    </option>

                    {/* ตัวเลือกที่อนุญาตให้เปลี่ยน */}
                    {status !== "pending" && (
                      <option value="pending">รออนุมัติ</option>
                    )}
                    {status !== "processing" && (
                      <option value="processing">ทำสัญญาแล้ว</option>
                    )}
                    {status !== "no_show" && (
                      <option value="no_show">ไม่มาทำสัญญา</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ปิด
              </button>
              {reservation.status !== "accepted" && (
                <button className="btn btn-primary" onClick={handleSave}>
                  บันทึก
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
