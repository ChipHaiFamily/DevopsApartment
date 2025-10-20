import React, { useEffect, useState } from "react";
import axios from "axios";

export default function InvoiceFormModal({
  open,
  onClose,
  onSubmit,
  invoice,
  mode = "create", // create | update
}) {
  const [tenants, setTenants] = useState([]);
  const [deletedPaymentIds, setDeletedPaymentIds] = useState([]);
  const [errors, setErrors] = useState({}); // ✅ เก็บข้อความ error ของแต่ละช่อง

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/tenants`)
      .then((res) =>
        setTenants(Array.isArray(res.data) ? res.data : res.data?.data ?? [])
      )
      .catch((err) => console.error("Error fetching tenants:", err));
  }, []);

  const [form, setForm] = useState({
    invoiceId: "",
    issueDate: new Date().toISOString().slice(0, 10), // ✅ วันที่ออกบิล = วันนี้
    dueDate: "",
    status: "pending",
    totalAmount: 0,
    tenantId: "",
    items: [],
    payments: [],
  });

  useEffect(() => {
    if (mode === "update" && invoice) {
      setForm({
        invoiceId: invoice.invoiceId || "",
        issueDate: invoice.issueDate || new Date().toISOString().slice(0, 10),
        dueDate: invoice.dueDate || "",
        status: invoice.status || "pending",
        totalAmount: Number(invoice.totalAmount) || 0,
        tenantId: invoice.tenant?.tenantId || "",
        items: Array.isArray(invoice.items) ? invoice.items : [],
        payments: Array.isArray(invoice.payments)
          ? invoice.payments.map((p) => ({
              paymentId: p.paymentId ?? p.id ?? null,
              id: p.paymentId ?? p.id ?? null,
              paymentDate: p.paymentDate || "",
              method: p.method || "",
              amount: Number(p.amount || 0),
            }))
          : [],
      });
      setDeletedPaymentIds([]);
    }
  }, [mode, invoice]);

  if (!open) return null;

  // ============================ Validation ============================
  const validateForm = () => {
    const newErrors = {};

    // วันที่กำหนดชำระ
    if (!form.dueDate) {
      newErrors.dueDate = "กรุณากรอกวันกำหนดชำระ ก่อนกดบันทึกข้อมูล";
    } else if (new Date(form.dueDate) <= new Date(form.issueDate)) {
      newErrors.dueDate = "วันกำหนดชำระ ต้องอยู่หลังวันเริ่มต้น";
    }

    // ผู้เช่า
    if (!form.tenantId) {
      newErrors.tenantId = "กรุณาเลือกผู้เช่า ก่อนกดบันทึกข้อมูล";
    }

    // รายละเอียดค่าใช้จ่าย
    if (!form.items || form.items.length === 0) {
      newErrors.items = "กรุณาเพิ่ม รายละเอียดค่าใช้จ่าย อย่างน้อย 1 รายการก่อนกดบันทึก";
    } else {
      form.items.forEach((item, index) => {
        if (!item.description?.trim()) {
          newErrors[`item_desc_${index}`] = "กรุณากรอก คำอธิบายค่าใช้จ่าย";
        }
        if (item.amount === "" || item.amount === null) {
          newErrors[`item_amount_${index}`] = "กรุณากรอกจำนวนเงิน";
        } else if (isNaN(item.amount)) {
          newErrors[`item_amount_${index}`] = "กรุณากรอกจำนวนเงินเป็นตัวเลข";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================ Event Handlers ============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { description: "", amount: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!validateForm()) return; // หยุดถ้ามี error

    const total = form.items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const payload = {
      invoiceId: form.invoiceId || undefined,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      totalAmount: total,
      tenant: { tenantId: form.tenantId },
      items: form.items.map((it) => ({
        description: it.description,
        amount: Number(it.amount || 0),
      })),
    };

    if (mode === "update") {
      payload.status = form.status;
      payload.payments = form.payments;
      payload.deletedPaymentIds = deletedPaymentIds;
    }

    onSubmit(payload);
  };

  // ============================ JSX ============================
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
              <h5 className="modal-title fw-bold">
                {mode === "create" ? "สร้างใบแจ้งหนี้ใหม่" : "แก้ไขใบแจ้งหนี้"}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="row g-3 mb-3">
                {/* เลขที่บิล & สถานะ */}
                {mode === "update" && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">เลขที่บิล</label>
                      <input
                        className="form-control"
                        name="invoiceId"
                        value={form.invoiceId}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">สถานะ</label>
                      <select
                        className="form-select"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="pending">รอดำเนินการ</option>
                        <option value="paid">ชำระแล้ว</option>
                        <option value="overdue">เกินกำหนด</option>
                      </select>
                    </div>
                  </>
                )}

                {/* วันที่ออกบิล */}
                <div className="col-md-6">
                  <label className="form-label">วันที่ออกบิล</label>
                  <input
                    type="date"
                    className="form-control"
                    name="issueDate"
                    value={form.issueDate}
                    readOnly //  ห้ามเปลี่ยน
                  />
                </div>

                {/* กำหนดชำระ */}
                <div className="col-md-6">
                  <label className="form-label">กำหนดชำระ</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    onBlur={validateForm}
                  />
                  {errors.dueDate && (
                    <small className="text-danger">{errors.dueDate}</small>
                  )}
                </div>

                {/* ผู้เช่า */}
                <div className="col-md-12">
                  <label className="form-label">ผู้เช่า</label>
                  <select
                    className="form-select"
                    name="tenantId"
                    value={form.tenantId}
                    onChange={handleChange}
                    onBlur={validateForm}
                  >
                    <option value="">-- เลือกผู้เช่า --</option>
                    {tenants.map((t) => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.user?.fullName} (ห้อง{" "}
                        {t.contract?.room?.roomNum || "-"})
                      </option>
                    ))}
                  </select>
                  {errors.tenantId && (
                    <small className="text-danger">{errors.tenantId}</small>
                  )}
                </div>
              </div>

              {/* รายละเอียดค่าใช้จ่าย */}
              <h6 className="fw-bold mt-3">รายละเอียดค่าใช้จ่าย</h6>
              {errors.items && <p className="text-danger">{errors.items}</p>}

              {form.items.map((item, index) => (
                <div className="row g-2 mb-2" key={index}>
                  <div className="col-md-7">
                    <input
                      className="form-control"
                      placeholder="คำอธิบาย"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      onBlur={validateForm}
                    />
                    {errors[`item_desc_${index}`] && (
                      <small className="text-danger">
                        {errors[`item_desc_${index}`]}
                      </small>
                    )}
                  </div>
                  <div className="col-md-3">
                    <input
                      type="number"
                      className="form-control text-end"
                      placeholder="จำนวนเงิน"
                      value={item.amount}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "amount",
                          e.target.value
                        )
                      }
                      onBlur={validateForm}
                    />
                    {errors[`item_amount_${index}`] && (
                      <small className="text-danger">
                        {errors[`item_amount_${index}`]}
                      </small>
                    )}
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => handleRemoveItem(index)}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-primary mt-2"
                onClick={handleAddItem}
              >
                + เพิ่มรายการ
              </button>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}