import React, { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

export default function RoomTypeManage({ onClose }) {
  const [roomTypes, setRoomTypes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // โหลดข้อมูลประเภทห้อง
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const res = await api.get("/room-types");
      // รองรับหลายรูปแบบ response
      const data =
        res.data?.data?.content || // ถ้า backend ใช้ pagination
        res.data?.data || // ถ้า backend ห่อ data ธรรมดา
        res.data || // ถ้าส่ง array ตรง ๆ
        [];

      //   console.log("Fetched Room Types:", data);
      setRoomTypes(data);
    } catch (err) {
      console.error("Error fetching room types:", err);
    }
  };

  // ฟังก์ชัน Toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // เมื่อมีการแก้ไขช่อง
  const handleChange = (index, field, value) => {
    setRoomTypes((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  // เพิ่มประเภทห้องใหม่
  const handleAdd = () => {
    if (isAdding) return; //  ถ้ายังมีฟอร์มใหม่ที่ยังไม่กรอก ห้ามเพิ่มซ้ำ
    setRoomTypes((prev) => [
      ...prev,
      { roomTypeId: "", name: "", price: "", description: "", isNew: true },
    ]);
    setIsAdding(true);
  };

  // เปิด Modal ยืนยันการลบ
  const confirmDelete = (type, index) => {
    setDeleteTarget({ type, index });
    setShowDeleteModal(true);
  };

  // ลบประเภทห้อง
  const handleDelete = async () => {
    const { type, index } = deleteTarget;
    setShowDeleteModal(false);

    try {
      if (type?.roomTypeId && !type.isNew) {
        await api.delete(`/room-types/${type.roomTypeId}`);
      }
      setRoomTypes((prev) => prev.filter((_, i) => i !== index));
      setIsAdding(false);
      showToast("ลบประเภทห้องเรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error("Error deleting room type:", err);
      showToast("ไม่สามารถลบประเภทห้องได้", "danger");
    }
  };

  // บันทึกข้อมูลห้อง (ทั้งแก้ไขและเพิ่มใหม่)
  const handleSave = async (index, type) => {
    try {
      if (type.isNew) {
        await api.post("/room-types", {
          name: type.name,
          price: Number(type.price),
          description: type.description,
          room_image: type.room_image,
        });
        setIsAdding(false);
        showToast("เพิ่มประเภทห้องสำเร็จ", "success");
      } else {
        await api.put(`/room-types/${type.roomTypeId}`, {
          name: type.name,
          price: Number(type.price),
          description: type.description,
          room_image: type.room_image,
        });
        showToast("บันทึกการแก้ไขสำเร็จ", "success");
      }
      fetchRoomTypes(); // reload หลังบันทึก
    } catch (err) {
      console.error("Error saving room type:", err);
      showToast("ไม่สามารถบันทึกข้อมูลได้", "danger");
    }
  };

  // ตรวจว่ากำลังเพิ่มอันใหม่อยู่หรือไม่
  const isIncompleteNew = roomTypes.some(
    (t) => t.isNew && (!t.name || !t.price)
  );

  return (
    <div
      className="container py-4"
     style={{ fontFamily: "Kanit, system-ui, sans-serif", maxWidth: "100%" }}
    >
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 show position-fixed top-0 end-0 m-3`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ zIndex: 1055 }}
        >
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToast({ show: false })}
            ></button>
          </div>
        </div>
      )}

      {/*  RoomType Cards */}
      {roomTypes.map((type, index) => (
        <div
          key={type.roomTypeId || index}
          className="card mb-3 shadow-sm border-0"
        >
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">ประเภทห้อง</label>
              <input
                type="text"
                className="form-control"
                value={type.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">ราคา</label>
              <input
                type="number"
                className="form-control"
                value={type.price}
                onChange={(e) => handleChange(index, "price", e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">คำอธิบาย</label>
              <textarea
                className="form-control"
                rows="3"
                value={type.description || ""}
                onChange={(e) =>
                  handleChange(index, "description", e.target.value)
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label">ลิงก์รูปภาพ</label>
              <input
                type="text"
                className="form-control"
                value={type.room_image || ""}
                onChange={(e) =>
                  handleChange(index, "room_image", e.target.value)
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* แสดงตัวอย่างภาพ (ถ้ามี) */}
            {type.room_image && (
              <div className="text-center mb-3">
                <img
                  src={type.room_image}
                  alt="room preview"
                  className="rounded shadow-sm"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    border: "1px solid #eee",
                    borderRadius: "10px",
                  }}
                />
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-outline-danger"
                onClick={() => confirmDelete(type, index)}
              >
                ลบ
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleSave(index, type)}
                disabled={!type.name || !type.price}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-primary"
          onClick={handleAdd}
          disabled={isIncompleteNew}
        >
          + เพิ่มประเภทห้อง
        </button>

        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={fetchRoomTypes}>
            โหลดใหม่
          </button>
          <button
            className="btn btn-outline-dark"
            onClick={() => {
              if (onClose) onClose(); // เรียกปิด modal จากหน้า RoomsManage
            }}
          >
            ปิด
          </button>
        </div>
      </div>

      {/* Modal ยืนยันการลบ */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-fullscreen modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-danger">
                    ยืนยันการลบ
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    ต้องการลบประเภทห้อง{" "}
                    <strong>{deleteTarget?.type?.name}</strong> ใช่หรือไม่?
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    ยกเลิก
                  </button>
                  <button className="btn btn-danger" onClick={handleDelete}>
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
