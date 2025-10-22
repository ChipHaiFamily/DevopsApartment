import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MaintenanceFormModal({ open, onClose, onSuccess, log }) {
  const isEdit = !!log;
  const [errors, setErrors] = useState({}); // เก็บข้อความ error

  const [form, setForm] = useState({
    logId: "",
    roomNum: "",
    logType: "",
    description: "",
    technician: "",
    cost: "",
    requestDate: new Date().toISOString().split("T")[0], // วันที่แจ้ง = วันนี้
    completedDate: "",
    status: "in_progress",
  });

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (isEdit && log) {
      setForm({
        logId: log.logId || "",
        roomNum: log.room?.roomNum || "",
        logType: log.logType || "",
        description: log.description || "",
        technician: log.technician || "",
        cost: log.cost || "",
        requestDate: log.requestDate || new Date().toISOString().split("T")[0],
        completedDate: log.completedDate || "",
        status: log.status || "in_progress",
      });
    }
  }, [isEdit, log]);

  if (!open) return null;

  //  Validation Function
  const validateForm = () => {
    const newErrors = {};

    if (!form.roomNum.trim()) {
      newErrors.roomNum = "กรุณากรอก หมายเลขห้อง";
    }

    if (!form.logType.trim()) {
      newErrors.logType = "กรุณากรอก ประเภทงาน";
    }

    if (!form.technician.trim()) {
      newErrors.technician = "กรุณากรอก ชื่อผู้ดำเงินงาน หรือผู้รับผิดชอบ";
    }

    if (form.cost === "" || form.cost === null || isNaN(form.cost)) {
      newErrors.cost = "กรุณากรอก จำนวนเงิน ค่าใช้จ่าย (ตัวเลข)";
    }

    if (!form.requestDate) {
      newErrors.requestDate = "กรุณากรอก วันที่แจ้งซ่อม";
    }

    if (!form.completedDate) {
      newErrors.completedDate = "กรุณากรอก วันที่ดำเนินกาเสร็จ";
    } else if (new Date(form.completedDate) <= new Date(form.requestDate)) {
      newErrors.completedDate = "วันที่เสร็จ ต้องอยู่อหลังวันที่แจ้ง";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return; // หยุดถ้าฟอร์มไม่ผ่าน validation

    const payload = {
      logId: form.logId,
      room: { roomNum: form.roomNum },
      logType: form.logType,
      description: form.description,
      technician: form.technician,
      cost: parseFloat(form.cost || 0),
      requestDate: form.requestDate,
      completedDate: form.completedDate || null,
      status: form.status,
    };

    try {
      if (isEdit) {
        await axios.put(`${baseURL}/maintenance-logs/${form.logId}`, payload);
      } else {
        await axios.post(`${baseURL}/maintenance-logs`, payload);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving maintenance log:", err);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ fontFamily: "Kanit, system-ui" }}>
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {isEdit ? "แก้ไขงานซ่อม" : "สร้างงานซ่อมใหม่"}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="row g-3">
                {isEdit && (
                  <div className="col-md-6">
                    <label className="form-label">รหัสงาน</label>
                    <input
                      className="form-control"
                      name="logId"
                      value={form.logId}
                      readOnly
                    />
                  </div>
                )}

                {/* Room Number */}
                <div className="col-md-6">
                  <label className="form-label">ห้อง</label>
                  <input
                    className="form-control"
                    name="roomNum"
                    value={form.roomNum}
                    onChange={handleChange}
                    readOnly={isEdit}
                    onBlur={validateForm}
                  />
                  {errors.roomNum && (
                    <small className="text-danger">{errors.roomNum}</small>
                  )}
                </div>

                {/* Log Type */}
                <div className="col-md-6">
                  <label className="form-label">ประเภทงาน</label>
                  <input
                    className="form-control"
                    name="logType"
                    value={form.logType}
                    onChange={handleChange}
                    readOnly={isEdit}
                    onBlur={validateForm}
                  />
                  {errors.logType && (
                    <small className="text-danger">{errors.logType}</small>
                  )}
                </div>

                {/* Description (optional) */}
                <div className="col-md-12">
                  <label className="form-label">รายละเอียด</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    readOnly={isEdit}
                  />
                </div>

                {/* Technician */}
                <div className="col-md-6">
                  <label className="form-label">ผู้ดำเนินการ</label>
                  <input
                    className="form-control"
                    name="technician"
                    value={form.technician}
                    onChange={handleChange}
                    onBlur={validateForm}
                  />
                  {errors.technician && (
                    <small className="text-danger">{errors.technician}</small>
                  )}
                </div>

                {/* Cost */}
                <div className="col-md-6">
                  <label className="form-label">ค่าใช้จ่าย</label>
                  <input
                    className="form-control"
                    name="cost"
                    type="number"
                    value={form.cost}
                    onChange={handleChange}
                    onBlur={validateForm}
                  />
                  {errors.cost && (
                    <small className="text-danger">{errors.cost}</small>
                  )}
                </div>

                {/* Request Date */}
                <div className="col-md-6">
                  <label className="form-label">วันที่แจ้ง</label>
                  <input
                    className="form-control"
                    name="requestDate"
                    type="date"
                    value={form.requestDate}
                    onChange={handleChange}
                    onBlur={validateForm}
                    readOnly={isEdit}
                  />
                  {errors.requestDate && (
                    <small className="text-danger">{errors.requestDate}</small>
                  )}
                </div>

                {/* Completed Date */}
                <div className="col-md-6">
                  <label className="form-label">วันที่เสร็จ</label>
                  <input
                    className="form-control"
                    name="completedDate"
                    type="date"
                    value={form.completedDate}
                    onChange={handleChange}
                    onBlur={validateForm}
                  />
                  {errors.completedDate && (
                    <small className="text-danger">{errors.completedDate}</small>
                  )}
                </div>

                {/* Status */}
                <div className="col-md-6">
                  <label className="form-label">สถานะ</label>
                  <select
                    className="form-select"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="in_progress">กำลังดำเนินการ</option>
                    <option value="completed">เสร็จแล้ว</option>
                    <option value="scheduled">วางแผน</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {isEdit ? "บันทึกการแก้ไข" : "สร้าง"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}