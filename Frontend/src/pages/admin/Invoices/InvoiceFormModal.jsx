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
  const [deletedPaymentIds, setDeletedPaymentIds] = useState([]); // track แถวที่ลบ

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
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    status: "pending",
    totalAmount: 0,
    tenantId: "",
    items: [],
    payments: [],
  });

  // preload data เวลา update เท่านั้น
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
      setDeletedPaymentIds([]); // เริ่มใหม่ทุกครั้ง
    } else if (mode === "create") {
      setForm({
        invoiceId: "",
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: "",
        status: "pending",
        totalAmount: 0,
        tenantId: "",
        items: [],
        payments: [],
      });
      setDeletedPaymentIds([]);
    }
  }, [mode, invoice]);

  if (!open) return null;

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

  const handlePaymentChange = (index, field, value) => {
    const newPayments = [...form.payments];
    newPayments[index][field] = field === "amount" ? Number(value || 0) : value;
    setForm((prev) => ({ ...prev, payments: newPayments }));
  };

  const handleAddPayment = () => {
    setForm((prev) => ({
      ...prev,
      payments: [
        ...prev.payments,
        { paymentId: null, id: null, paymentDate: "", method: "", amount: 0 },
      ],
    }));
  };

  const handleRemovePayment = (index) => {
    setForm((prev) => {
      const target = prev.payments[index];
      if (target?.paymentId || target?.id) {
        // เก็บ id ที่ถูกลบไว้ ส่งให้ backend ลบจริง
        setDeletedPaymentIds((list) => [
          ...list,
          target.paymentId ?? target.id,
        ]);
      }
      return {
        ...prev,
        payments: prev.payments.filter((_, i) => i !== index),
      };
    });
  };

  const buildPayload = (form, mode, deletedPaymentIds) => {
    const total = (form.items || []).reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const items = (form.items || []).map((it) => {
      const base = {
        description: it.description,
        amount: Number(it.amount || 0),
      };
      const existingId = it.itemId ?? it.id;
      if (existingId) base.itemId = existingId;
      return base;
    });

    let payments = [];
    if (mode === "update") {
      payments = (form.payments || []).map((p) => ({
        paymentId: p.paymentId ?? p.id ?? null,
        id: p.paymentId ?? p.id ?? null,
        paymentDate: (p.paymentDate || new Date().toISOString().slice(0, 10)).trim(),
        method: (p.method || "").trim(),
        amount: Number(p.amount || 0),
      }));
    }

    const payload = {
      invoiceId: form.invoiceId || undefined, // create จะไม่มี
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      totalAmount: total, // คิดจาก items
      tenant: {
        tenantId: form.tenantId, // ใช้แบบ object เสมอ
      },
      items,
    };

    if (mode === "update") {
      payload.status = form.status;
      payload.payments = payments; // ชุดที่เหลือหลังแก้/เพิ่ม
      payload.deletedPaymentIds = deletedPaymentIds; // id ที่ถูกลบออก
    }

    return payload;
  };

  const handleSubmit = () => {
    // debug form ก่อน build
    console.log(
      "[InvoiceFormModal] form (raw) =",
      JSON.parse(JSON.stringify(form))
    );

    if (mode === "create") {
      const payload = buildPayload(form, "create", []);
      console.log(
        "[InvoiceFormModal] CREATE payload =",
        JSON.stringify(payload, null, 2)
      );
      onSubmit(payload);
      return;
    }

    if (mode === "update") {
      for (const p of form.payments) {
        if (!p.paymentDate || !p.method || !(p.amount > 0)) {
          alert(
            "กรุณากรอกข้อมูลรายการชำระเงินให้ครบ (วันที่ / วิธี / จำนวนเงิน > 0)"
          );
          return;
        }
      }
      const payload = buildPayload(form, "update", deletedPaymentIds);
      // console.log(
      //   "[InvoiceFormModal] UPDATE payload =",
      //   JSON.stringify(payload, null, 2)
      // );
      // console.table(
      //   (payload.items || []).map((x) => ({
      //     itemId: x.itemId ?? null,
      //     description: x.description,
      //     amount: x.amount,
      //   }))
      // );
      // console.table(
      //   (payload.payments || []).map((x) => ({
      //     id: x.id ?? null,
      //     paymentId: x.paymentId ?? null,
      //     paymentDate: x.paymentDate,
      //     method: x.method,
      //     amount: x.amount,
      //   }))
      // );
      onSubmit(payload);
    }
  };

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
                {/* เลขที่บิล & สถานะ: เฉพาะ update */}
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

                <div className="col-md-6">
                  <label className="form-label">วันที่ออกบิล</label>
                  <input
                    type="date"
                    className="form-control"
                    name="issueDate"
                    value={form.issueDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">กำหนดชำระ</label>
                  <input
                    type="date"
                    className="form-control"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">ผู้เช่า</label>
                  <select
                    className="form-select"
                    name="tenantId"
                    value={form.tenantId}
                    onChange={handleChange}
                  >
                    <option value="">-- เลือกผู้เช่า --</option>
                    {tenants.map((t) => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.user?.fullName} (ห้อง{" "}
                        {t.contract?.room?.roomNum || "-"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items */}
              <h6 className="fw-bold mt-3">รายละเอียดค่าใช้จ่าย</h6>
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
                    />
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
                          Number(e.target.value)
                        )
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

              {/* Payments: เฉพาะ update */}
              {mode === "update" && (
                <>
                  <h6 className="fw-bold mt-4">การชำระเงิน</h6>
                  {form.payments.map((p, index) => (
                    <div
                      className="row g-2 mb-2"
                      key={p.paymentId ?? p.id ?? `new-${index}`}
                    >
                      <div className="col-md-4">
                        <input
                          type="date"
                          className="form-control"
                          value={p.paymentDate}
                          onChange={(e) =>
                            handlePaymentChange(
                              index,
                              "paymentDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          className="form-control"
                          placeholder="วิธีชำระ (เช่น โอน, เงินสด)"
                          value={p.method}
                          onChange={(e) =>
                            handlePaymentChange(index, "method", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="number"
                          className="form-control text-end"
                          placeholder="จำนวนเงิน"
                          value={p.amount}
                          onChange={(e) =>
                            handlePaymentChange(
                              index,
                              "amount",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="col-md-1">
                        <button
                          type="button"
                          className="btn btn-outline-danger w-100"
                          onClick={() => handleRemovePayment(index)}
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary mt-2"
                    onClick={handleAddPayment}
                  >
                    + เพิ่มการชำระเงิน
                  </button>
                </>
              )}
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
