import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MaintenanceScheduleFormModal({ open, onClose, onSuccess, schedule }) {
  const isEdit = !!schedule;

  const [form, setForm] = useState({
    scheduleId: "",
    taskName: "",
    cycleInterval: "",
    lastCompleted: "",
    nextDue: "",
  });

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (isEdit && schedule) {
      setForm({
        scheduleId: schedule.scheduleId || "",
        taskName: schedule.taskName || "",
        cycleInterval: schedule.cycleInterval || "",
        lastCompleted: schedule.lastCompleted || "",
        nextDue: schedule.nextDue || "",
      });
    }
  }, [isEdit, schedule]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      taskName: form.taskName,
      cycleInterval: form.cycleInterval,
      lastCompleted: form.lastCompleted || null,
      nextDue: form.nextDue || null,
    };

    try {
      if (isEdit) {
        await axios.put(`${baseURL}/maintenance-schedules/${form.scheduleId}`, {
          ...payload,
          scheduleId: form.scheduleId,
        });
      } else {
        await axios.post(`${baseURL}/maintenance-schedules`, payload);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving maintenance schedule:", err);
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
                {isEdit ? "แก้ไขตารางซ่อมบำรุง" : "สร้างตารางซ่อมบำรุง"}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="row g-3">
                {isEdit && (
                  <div className="col-md-6">
                    <label className="form-label">รหัสกำหนดการ</label>
                    <input className="form-control" value={form.scheduleId} readOnly />
                  </div>
                )}
                <div className="col-md-12">
                  <label className="form-label">ชื่องาน</label>
                  <input
                    className="form-control"
                    name="taskName"
                    value={form.taskName}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">รอบการทำงาน (เช่น 90_days)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="cycleInterval"
                    value={form.cycleInterval}
                    onChange={handleChange}
                    placeholder="เช่น 90_days"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ทำล่าสุด</label>
                  <input
                    type="date"
                    className="form-control"
                    name="lastCompleted"
                    value={form.lastCompleted}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">กำหนดครั้งถัดไป</label>
                  <input
                    type="date"
                    className="form-control"
                    name="nextDue"
                    value={form.nextDue}
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
                {isEdit ? "บันทึกการแก้ไข" : "สร้าง"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
