import React, { useState, useEffect } from "react";

export default function SupplyFormModal({ open, onClose, onSubmit, supply }) {
  const isEdit = Boolean(supply);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (supply) {
        setForm({
          name: supply.name || "",
          quantity: supply.quantity || "",
        });
      } else {
        setForm({
          name: "",
          quantity: "",
        });
      }
      setErrors({});
    }
  }, [open, supply]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "กรุณากรอกชื่อสิ่งของ";
    if (form.quantity === "" || isNaN(form.quantity) || Number(form.quantity) < 0)
      newErrors.quantity = "กรุณากรอกจำนวนให้ถูกต้อง";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content" style={{ fontFamily: "Kanit" }}>
            <div className="modal-header">
              <h5 className="fw-bold mb-0">
                {isEdit ? "แก้ไขข้อมูลสิ่งของ" : "สร้างบันทึกสิ่งของ"}
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* ชื่อสิ่งของ */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">ชื่อ</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="กรอกชื่อสิ่งของ เช่น Apple Pen"
                  />
                  {errors.name && <small className="text-danger">{errors.name}</small>}
                </div>

                {/* จำนวน */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">จำนวน</label>
                  <input
                    type="number"
                    className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                    name="quantity"
                    min="0"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="กรอกจำนวน เช่น 10"
                  />
                  {errors.quantity && (
                    <small className="text-danger">{errors.quantity}</small>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? "บันทึก" : "สร้าง"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
