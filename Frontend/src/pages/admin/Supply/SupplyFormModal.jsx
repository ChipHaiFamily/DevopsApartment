import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

export default function SupplyFormModal({
  open,
  onClose,
  onSubmit,
  onSuccess,
  supply,
  supplies = [],
}) {
  const isEdit = Boolean(supply);
  const [form, setForm] = useState({
    item_Name: "",
    quantity: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (supply) {
        setForm({
          item_Name: supply.item_Name || supply.name || "",
          quantity: supply.quantity || "",
        });
      } else {
        setForm({
          item_Name: "",
          quantity: "",
        });
      }
      setErrors({});
    }
  }, [open, supply]);

  const validate = () => {
    const newErrors = {};
    // ตรวจชื่อ
    if (!form.item_Name.trim()) newErrors.item_Name = "กรุณากรอกชื่อสิ่งของ";

    // ตรวจจำนวน (ต้องเป็นจำนวนเต็มบวกเท่านั้น)
    const q = form.quantity.trim();
    if (q === "") {
      newErrors.quantity = "กรุณากรอกจำนวน";
    } else if (Number(q) <= 0) {
      newErrors.quantity = "จำนวนต้องมากกว่า 0";
    } else if (!/^[0-9]+$/.test(q)) {
      newErrors.quantity = "กรุณากรอกจำนวนเต็มเท่านั้น (ห้ามทศนิยม)";
    }

    // ตรวจชื่อซ้ำ (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
    const nameExists = supplies.some(
      (s) =>
        s.item_Name?.trim().toLowerCase() ===
        form.item_Name.trim().toLowerCase()
    );
    if (!isEdit && nameExists) {
      newErrors.item_Name = "ชื่อสิ่งของนี้มีอยู่แล้วในระบบ";
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        item_Name: form.item_Name.trim(),
        quantity: Number(form.quantity),
      };
      console.log("ส่งข้อมูล:", payload);
      const res = await api.post("/supplies", payload);

      //  แจ้ง parent ว่าสำเร็จ + ส่งข้อความ
      if (onSuccess) onSuccess(true, "เพิ่มสิ่งของใหม่เรียบร้อยแล้ว!");
      onClose();
    } catch (err) {
      console.error("Error saving supply:", err);
      if (onSuccess)
        onSuccess(
          false,
          err?.response?.data?.message || "ไม่สามารถเพิ่มสิ่งของได้"
        );
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
              <h5 className="fw-bold mb-0">
                {isEdit ? "แก้ไขข้อมูลสิ่งของ" : "สร้างบันทึกสิ่งของ"}
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                {/* ชื่อสิ่งของ */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">ชื่อ</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.item_Name ? "is-invalid" : ""
                    }`}
                    name="item_Name"
                    value={form.item_Name}
                    onChange={handleChange}
                    placeholder="กรอกชื่อสิ่งของ เช่น Apple Pen"
                  />
                  {errors.item_Name && (
                    <small className="text-danger">{errors.item_Name}</small>
                  )}
                </div>

                {/* จำนวน */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">จำนวน</label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.quantity ? "is-invalid" : ""
                    }`}
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
3;
