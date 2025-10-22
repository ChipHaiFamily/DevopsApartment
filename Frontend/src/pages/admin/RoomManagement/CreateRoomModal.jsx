import React, { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

export default function CreateRoomModal({ open, onClose, onSubmit }) {
  const [roomTypes, setRoomTypes] = useState([]);
  const [form, setForm] = useState({
    roomTypeName: "",
    roomNum: "",
    floor: "",
  });
  const [error, setError] = useState("");

  // โหลดประเภทห้องจาก backend
  useEffect(() => {
    if (open) {
      api
        .get("/room-types") // ดึงประเภทห้องทั้งหมดจาก backend
        .then((res) => {
          //   console.log("Room types:", res.data);
          setRoomTypes(
            Array.isArray(res.data) ? res.data : res.data.data ?? []
          );
        })
        .catch((err) => {
          console.error("Error fetching room types:", err);
        });
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.roomTypeId || !form.roomNum) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      await api.post("/rooms", {
        roomTypeId: form.roomTypeId,
        roomNum: form.roomNum,
      });

      // callback จาก props ถ้ามี
      if (onSubmit) await onSubmit();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "ไม่สามารถบันทึกได้");
    }
  };

  return (
    <>
      {/* พื้นหลังมืด */}
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div
            className="modal-content"
            style={{ fontFamily: "Kanit, system-ui, sans-serif" }}
          >
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">สร้างห้องพักใหม่</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="row g-3 mb-3">
                {/* ประเภทห้อง */}
                <div className="col-md-12">
                  <label className="form-label">ประเภทห้อง</label>
                  <select
                    className="form-select"
                    name="roomTypeId"
                    value={form.roomTypeId}
                    onChange={handleChange}
                  >
                    <option value="">-- เลือกประเภทห้อง --</option>
                    {roomTypes.map((type) => (
                      <option key={type.roomTypeId} value={type.roomTypeId}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* หมายเลขห้อง */}
                <div className="col-md-6">
                  <label className="form-label">หมายเลขห้อง</label>
                  <input
                    type="text"
                    className="form-control"
                    name="roomNum"
                    value={form.roomNum}
                    onChange={handleChange}
                  />
                </div>

                {/* ชั้น */}
                <div className="col-md-6">
                  <label className="form-label">ชั้น</label>
                  <input
                    type="text"
                    className="form-control"
                    name="floor"
                    value={form.floor}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                สร้าง
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
