import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

export default function UsageFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = "create", // create | edit
}) {
  const isEdit = mode === "edit";
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  // ===== Utility: วันที่ปัจจุบัน =====
  const getToday = () => new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    room: "",
    period: "",
    recordDate: getToday(),
    type: "น้ำ",
    unit: "",
  });

  // ===== โหลดข้อมูลห้อง =====
  useEffect(() => {
    if (!open) return;
    const fetchRooms = async () => {
      try {
        const res = await api.get("rooms");
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setRooms(data.sort((a, b) => Number(a.roomNum) - Number(b.roomNum)));
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, [open]);

  // ===== โหลดข้อมูลเดิม (โหมด edit) =====
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData);
      } else {
        setForm({
          room: "",
          period: "",
          recordDate: getToday(),
          type: "น้ำ",
          unit: "",
        });
      }
      setErrors({});
      setError("");
    }
  }, [open, initialData]);

  // ===== Validation =====
  const validateForm = () => {
    const newErrors = {};

    if (!form.room) newErrors.room = "กรุณาเลือกห้อง";
    if (!form.period) newErrors.period = "กรุณาเลือกรอบเดือน";
    if (!form.recordDate) newErrors.recordDate = "กรุณาระบุวันที่บันทึก";

    if (!form.type) newErrors.type = "กรุณาเลือกประเภท";
    if (form.unit === "" || form.unit === null)
      newErrors.unit = "กรุณากรอกจำนวนหน่วย";
    else if (isNaN(form.unit) || Number(form.unit) <= 0)
      newErrors.unit = "จำนวนหน่วยต้องมากกว่า 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== Handle input change =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ===== Handle submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      console.error("Error saving usage:", err);
      setError(err?.response?.data?.message || "ไม่สามารถบันทึกได้");
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content" style={{ fontFamily: "Kanit" }}>
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {isEdit ? "แก้ไขบันทึกการใช้น้ำ/ไฟฟ้า" : "บันทึกการใช้น้ำ/ไฟฟ้า"}
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* ห้อง */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">ห้อง</label>
                  <select
                    className={`form-select ${errors.room ? "is-invalid" : ""}`}
                    name="room"
                    value={form.room}
                    onChange={handleChange}
                  >
                    <option value="">-- เลือกห้อง --</option>
                    {rooms.map((r) => (
                      <option key={r.roomNum} value={r.roomNum}>
                        ห้อง {r.roomNum} {r.roomTypeName || ""}
                      </option>
                    ))}
                  </select>
                  {errors.room && <small className="text-danger">{errors.room}</small>}
                </div>

                {/* รอบและวันที่บันทึก */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">รอบ</label>
                    <input
                      type="month"
                      name="period"
                      className={`form-control ${errors.period ? "is-invalid" : ""}`}
                      value={form.period}
                      onChange={handleChange}
                    />
                    {errors.period && <small className="text-danger">{errors.period}</small>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">วันที่บันทึก</label>
                    <input
                      type="date"
                      name="recordDate"
                      className={`form-control ${errors.recordDate ? "is-invalid" : ""}`}
                      value={form.recordDate}
                      onChange={handleChange}
                    />
                    {errors.recordDate && <small className="text-danger">{errors.recordDate}</small>}
                  </div>
                </div>

                {/* ประเภทและหน่วย */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">ประเภท</label>
                    <select
                      className={`form-select ${errors.type ? "is-invalid" : ""}`}
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="น้ำ">น้ำ</option>
                      <option value="ไฟฟ้า">ไฟฟ้า</option>
                    </select>
                    {errors.type && <small className="text-danger">{errors.type}</small>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">การใช้งาน (หน่วย)</label>
                    <input
                      type="number"
                      className={`form-control ${errors.unit ? "is-invalid" : ""}`}
                      name="unit"
                      min="0"
                      step="0.1"
                      value={form.unit}
                      onChange={handleChange}
                    />
                    {errors.unit && <small className="text-danger">{errors.unit}</small>}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? "บันทึกการแก้ไข" : "สร้าง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
