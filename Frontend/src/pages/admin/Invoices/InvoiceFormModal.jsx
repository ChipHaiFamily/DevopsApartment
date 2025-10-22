import React, { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

export default function InvoiceFormModal({
  open,
  onClose,
  onSubmit,
  invoice,
  mode = "create", // create | update
}) {
  const [tenants, setTenants] = useState([]);
  const [deletedPaymentIds, setDeletedPaymentIds] = useState([]);
  const [errors, setErrors] = useState({}); // เก็บข้อความ error ของแต่ละช่อง

  useEffect(() => {
    api
      .get("tenants")
      .then((res) =>
        setTenants(Array.isArray(res.data) ? res.data : res.data?.data ?? [])
      )
      .catch((err) => console.error("Error fetching tenants:", err));
  }, []);

  const [form, setForm] = useState({
    invoiceId: "",
    issueDate: new Date().toISOString().slice(0, 10), // วันที่ออกบิล = วันนี้
    dueDate: "",
    status: "pending",
    totalAmount: 0,
    tenantId: "",
    items: [
      { type: "ค่าน้ำ", description: "Water Bill", amount: 0 },
      { type: "ค่าไฟฟ้า", description: "Electricity Bill", amount: 0 },
      { type: "ค่าห้อง", description: "Rent Bill", amount: 0 },
    ],
    payments: [],
  });

  // ตรวจประเภทที่ถูกเลือกไปแล้ว (ไว้ใช้ disable dropdown)
  const selectedTypes = form.items.map((i) => i.type);

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
      newErrors.items =
        "กรุณาเพิ่ม รายละเอียดค่าใช้จ่าย อย่างน้อย 1 รายการก่อนกดบันทึก";
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

  // --- handleItemChange ---
  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;

    // อัปเดต description อัตโนมัติตามประเภท
    if (field === "type") {
      switch (value) {
        case "ค่าน้ำ":
          newItems[index].description = "Water Bill";
          break;
        case "ค่าไฟฟ้า":
          newItems[index].description = "Electricity Bill";
          break;
        case "ค่าห้อง":
          newItems[index].description = "Rent Bill";
          break;
        default:
          newItems[index].description = "";
      }
    }

    setForm((prev) => ({ ...prev, items: newItems }));
  };

  // --- handleAddItem ---
  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { type: "อื่น ๆ", description: "", amount: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // --- handleSubmit (map description ก่อนส่ง) ---
  const handleSubmit = () => {
    if (!validateForm()) return;

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
        description:
          it.type === "ค่าน้ำ"
            ? "Water Bill"
            : it.type === "ค่าไฟฟ้า"
            ? "Electricity Bill"
            : it.type === "ค่าห้อง"
            ? "Rent Bill"
            : it.description,
        amount: Number(it.amount || 0),
      })),
    };

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
                        {t.user?.fullName} ( ห้อง{" "}
                        {t.contract
                          ?.filter((c) => c.status === "active") // เลือกเฉพาะสัญญาที่ยัง active
                          ?.sort(
                            (a, b) =>
                              new Date(b.startDate) - new Date(a.startDate)
                          ) // เผื่อมีหลาย active เอาอันล่าสุด
                          ?.at(0)?.room?.roomNum || "-"}
                        )
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
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={item.type}
                      onChange={(e) =>
                        handleItemChange(index, "type", e.target.value)
                      }
                    >
                      <option
                        value="ค่าน้ำ"
                        disabled={
                          selectedTypes.includes("ค่าน้ำ") &&
                          item.type !== "ค่าน้ำ"
                        }
                      >
                        ค่าน้ำ
                      </option>
                      <option
                        value="ค่าไฟฟ้า"
                        disabled={
                          selectedTypes.includes("ค่าไฟฟ้า") &&
                          item.type !== "ค่าไฟฟ้า"
                        }
                      >
                        ค่าไฟฟ้า
                      </option>
                      <option
                        value="ค่าห้อง"
                        disabled={
                          selectedTypes.includes("ค่าห้อง") &&
                          item.type !== "ค่าห้อง"
                        }
                      >
                        ค่าห้อง
                      </option>
                      <option value="อื่น ๆ">อื่น ๆ</option>
                    </select>
                  </div>

                  <div className="col-md-5">
                    <input
                      className="form-control"
                      placeholder={
                        item.type === "อื่น ๆ"
                          ? "ระบุรายการอื่น ๆ"
                          : item.description
                      }
                      value={item.type === "อื่น ๆ" ? item.description : ""}
                      readOnly={item.type !== "อื่น ๆ"}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-2">
                    <input
                      type="number"
                      className="form-control text-end"
                      placeholder="จำนวนเงิน"
                      value={item.amount}
                      onChange={(e) =>
                        handleItemChange(index, "amount", e.target.value)
                      }
                    />
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
