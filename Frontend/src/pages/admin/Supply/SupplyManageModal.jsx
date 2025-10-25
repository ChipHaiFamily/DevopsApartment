import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

export default function SupplyManageModal({ open, onClose, supply, onSubmit }) {
  const [form, setForm] = useState({
    itemId: "",
    item_Name: "",
    action: "withdraw",
    quantity: "",
    operator: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (supply) {
        setForm({
          itemId: supply.itemId || "",
          item_Name: supply.item_Name || supply.name || "",
          action: "withdraw",
          quantity: "",
          operator: "",
        });
      } else {
        setForm({
          itemId: "",
          item_Name: "",
          action: "withdraw",
          quantity: "",
          operator: "",
        });
      }
      setErrors({});
    }
  }, [open, supply]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ตรวจสอบข้อมูลก่อนส่ง
  const validate = () => {
    const newErrors = {};
    const q = form.quantity.toString().trim();

    if (!form.operator.trim()) newErrors.operator = "กรุณากรอกชื่อผู้ทำรายการ";

    if (q === "") {
      newErrors.quantity = "กรุณากรอกจำนวน";
    } else if (Number(q) <= 0) {
      newErrors.quantity = "จำนวนต้องมากกว่า 0";
    } else if (!/^[0-9]+$/.test(q)) {
      newErrors.quantity = "จำนวนต้องเป็นตัวเลขเท่านั้น";
    } else if (
      form.action === "withdraw" &&
      supply &&
      Number(q) > Number(supply.quantity)
    ) {
      newErrors.quantity = `ไม่สามารถเบิกเกินจำนวนที่มี (${supply.quantity})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        itemId: form.itemId,
        item_Name: form.item_Name.trim(),
        quantity: Number(form.quantity),
        operator: form.operator.trim(),
        action: form.action,
      };

      console.log("ส่งข้อมูลไป /supplies-history :", payload);
      await api.post("/supplies-history", payload);

      if (onSubmit) onSubmit();
      onClose();
    } catch (err) {
      console.error("Error posting to /supplies-history:", err);
      setErrors({
        submit: err?.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้",
      });
    }
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

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                {/* รหัสสิ่งของ / ชื่อ */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      รหัสสิ่งของ
                    </label>
                    <input
                      type="text"
                      name="itemId"
                      className="form-control"
                      value={form.itemId}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      ชื่อสิ่งของ
                    </label>
                    <input
                      type="text"
                      name="item_Name"
                      className="form-control"
                      value={form.item_Name}
                      readOnly
                    />
                  </div>
                </div>

                {/* การทำรายการ / จำนวน */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      การทำรายการ
                    </label>
                    <select
                      name="action"
                      className="form-select"
                      value={form.action}
                      onChange={handleChange}
                    >
                      <option value="withdraw">เบิกใช้</option>
                      <option value="restock">เติม</option>
                      <option value="return">คืน</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">จำนวน</label>
                    <input
                      type="text"
                      name="quantity"
                      className={`form-control ${
                        errors.quantity ? "is-invalid" : ""
                      }`}
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="จำนวน"
                    />
                    {errors.quantity && (
                      <small className="text-danger">{errors.quantity}</small>
                    )}
                  </div>
                </div>

                {/* ผู้ทำรายการ */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">ผู้ทำรายการ</label>
                  <input
                    type="text"
                    name="operator"
                    className={`form-control ${
                      errors.operator ? "is-invalid" : ""
                    }`}
                    value={form.operator}
                    onChange={handleChange}
                    placeholder="ชื่อผู้ดำเนินการ"
                  />
                  {errors.operator && (
                    <small className="text-danger">{errors.operator}</small>
                  )}
                </div>

                {/* error จาก backend */}
                {errors.submit && (
                  <div className="alert alert-danger py-2">{errors.submit}</div>
                )}
              </div>

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
