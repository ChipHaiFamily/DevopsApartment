import React, { useState, useEffect } from "react";

export default function SupplyManageModal({ open, onClose, supply, onSubmit }) {
  const [form, setForm] = useState({
    itemId: "",
    name: "",
    action: "เบิกใช้/เติม/เลิกใช้",
    quantity: "",
    operator: "",
  });

  useEffect(() => {
    if (open) {
      if (supply) {
        setForm({
          itemId: supply.itemId || "",
          name: supply.name || "",
          action: "เบิกใช้/เติม/เลิกใช้",
          quantity: supply.quantity || "",
          operator: "",
        });
      } else {
        setForm({
          itemId: "",
          name: "",
          action: "เบิกใช้/เติม/เลิกใช้",
          quantity: "",
          operator: "",
        });
      }
    }
  }, [open, supply]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.quantity || !form.operator.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
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
              <h5 className="fw-bold mb-0">จัดการสิ่งของ</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* รหัสสิ่งของ / ชื่อ */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">รหัสสิ่งของ</label>
                    <input
                      type="text"
                      name="itemId"
                      className="form-control"
                      value={form.itemId}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">ชื่อ</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="ชื่อสิ่งของ"
                    />
                  </div>
                </div>

                {/* การทำรายการ / จำนวน */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">การทำรายการ</label>
                    <select
                      name="action"
                      className="form-select"
                      value={form.action}
                      onChange={handleChange}
                    >
                      <option value="เบิกใช้">เบิกใช้</option>
                      <option value="เติม">เติม</option>
                      <option value="เลิกใช้">เลิกใช้</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">จำนวน</label>
                    <input
                      type="number"
                      name="quantity"
                      className="form-control"
                      min="0"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="จำนวน"
                    />
                  </div>
                </div>

                {/* ผู้ทำรายการ */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">ผู้ทำรายการ</label>
                  <input
                    type="text"
                    name="operator"
                    className="form-control"
                    value={form.operator}
                    onChange={handleChange}
                    placeholder="ชื่อผู้ดำเนินการ"
                  />
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
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
