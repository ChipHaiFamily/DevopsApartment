import React, { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

export default function PaymentFormModal({ open, onClose, onSubmit }) {
  if (!open) return null;

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    method: "",
    amount: "",
    fine: 0,
    receiptFile: null,
    previewUrl: null,
  });

  // ดึงใบแจ้งหนี้ที่ยังไม่ชำระ
  useEffect(() => {
    if (open) {
      api
        .get("/invoices")
        .then((res) => {
          const all = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const unpaid = all.filter((inv) =>
            ["pending", "overdue", "partial"].includes(
              inv.status?.toLowerCase()
            )
          );
          setInvoices(unpaid);
        })
        .catch((err) => console.error("Error fetching invoices:", err));
    }
  }, [open]);

  // ฟังก์ชันช่วยคำนวณยอดรวมที่จ่ายไปแล้ว
  const getPaidTotal = (invoice) => {
    if (!invoice?.payments || invoice.payments.length === 0) return 0;
    return invoice.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  // ฟังก์ชันคำนวณยอดค้าง
  const getRemainingBalance = (invoice) => {
    if (!invoice) return 0;
    const paid = getPaidTotal(invoice);
    return invoice.totalAmount - paid;
  };

  // เมื่อเลือกใบแจ้งหนี้
  const handleSelectInvoice = (invoiceId) => {
    const inv = invoices.find((i) => i.invoiceId === invoiceId);
    setSelectedInvoice(inv || null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, receiptFile: file, previewUrl: preview }));
    } else {
      setForm((prev) => ({ ...prev, receiptFile: null, previewUrl: null }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedInvoice) return alert("กรุณาเลือกใบแจ้งหนี้ก่อน");
    if (!form.method) return alert("กรุณาเลือกวิธีการชำระเงิน");

    const payload = {
      paymentDate: form.paymentDate,
      amount: Number(form.amount || 0),
      method: form.method,
      invoice: {
        invoiceId: selectedInvoice.invoiceId,
      },
    };

    try {
      // สร้างการชำระเงิน
      const res = await api.post("/payments", payload);
      const paymentId = res.data?.paymentId;

      // ถ้ามีไฟล์ -> อัปโหลด
      if (form.receiptFile && paymentId) {
        const fd = new FormData();
        fd.append("file", form.receiptFile);
        await api.post(`/payments/slips/${paymentId}/upload`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("บันทึกการชำระเงินสำเร็จ!");
      onClose();

      onSubmit?.();
    } catch (err) {
      console.error("Error creating payment:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกการชำระเงิน");
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
            <div className="modal-header">
              <h5 className="modal-title fw-bold">สร้างการชำระเงินใหม่</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* Dropdown เลือกใบแจ้งหนี้ */}
              <div className="mb-3">
                <label className="form-label">เลขที่ใบแจ้งหนี้</label>
                <select
                  className="form-select"
                  onChange={(e) => handleSelectInvoice(e.target.value)}
                >
                  <option value="">-- เลือกใบแจ้งหนี้ที่ยังไม่ชำระ --</option>
                  {invoices.map((inv) => (
                    <option key={inv.invoiceId} value={inv.invoiceId}>
                      {inv.invoiceId} (ห้อง{" "}
                      {inv.tenant?.contract?.[0]?.room?.roomNum || "-"})
                    </option>
                  ))}
                </select>
              </div>

              {/* รายละเอียดใบแจ้งหนี้ */}
              {selectedInvoice && (
                <div className="border rounded p-3  mb-3">
                  <p>
                    <strong>ห้อง:</strong>{" "}
                    {selectedInvoice.tenant?.contract?.[0]?.room?.roomNum ||
                      "-"}
                  </p>
                  <p>
                    <strong>ผู้เช่า:</strong>{" "}
                    {selectedInvoice.tenant?.user?.fullName || "-"}
                  </p>
                  <p>
                    <strong>วันที่ออกบิล:</strong> {selectedInvoice.issueDate}
                  </p>
                  <p>
                    <strong>กำหนดชำระ:</strong> {selectedInvoice.dueDate}
                  </p>

                  <h6 className="fw-bold mt-3">รายละเอียดค่าใช้จ่าย</h6>
                  <table className="table table-sm">
                    <thead className="table">
                      <tr>
                        <th>รายการ</th>
                        <th className="text-end">จำนวนเงิน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items?.map((it, i) => (
                        <tr key={i}>
                          <td>{it.description}</td>
                          <td className="text-end">
                            ฿{it.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="fw-bold">
                        <td>รวม</td>
                        <td className="text-end">
                          ฿{selectedInvoice.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* ส่วนรายละเอียดการชำระ */}
              <div className="border rounded p-3 mt-3">
                <table className="table table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">ชำระแล้วรวม</td>
                      <td className="text-end">
                        ฿
                        {selectedInvoice
                          ? getPaidTotal(selectedInvoice).toLocaleString()
                          : 0}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">ค้างชำระ</td>
                      <td className="text-end text-danger">
                        ฿
                        {selectedInvoice
                          ? getRemainingBalance(
                              selectedInvoice
                            ).toLocaleString()
                          : 0}
                      </td>
                    </tr>
                    <tr className="fw-bold border-top">
                      <td>ค้างชำระสุทธิ</td>
                      <td className="text-end text-success">
                        ฿
                        {selectedInvoice
                          ? (
                              getRemainingBalance(selectedInvoice) -
                              Number(form.amount || 0)
                            ).toLocaleString()
                          : 0}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ช่องกรอกข้อมูลเพิ่มเติม */}
                <div className="row g-3 mt-3">
                  <div className="col-md-4">
                    <label className="form-label">วันที่ชำระ</label>
                    <input
                      type="date"
                      name="paymentDate"
                      className="form-control"
                      value={form.paymentDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">รูปแบบการจ่าย</label>
                    <select
                      className="form-select"
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                    >
                      <option value="">-- เลือกวิธีชำระ --</option>
                      <option value="Cash">เงินสด</option>
                      <option value="Bank Transfer">โอนผ่านธนาคาร</option>
                      <option value="PromptPay">พร้อมเพย์</option>
                      <option value="Credit Card">บัตรเครดิต</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">จำนวนเงิน</label>
                    <input
                      type="number"
                      className="form-control text-end"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                      onClick={() =>
                        document.getElementById("receiptFile").click()
                      }
                    >
                      + อัปโหลดหลักฐาน
                    </button>
                    <input
                      type="file"
                      id="receiptFile"
                      className="d-none"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                    {form.receiptFile && (
                      <div className="mt-2">
                        <div className="small text-success mb-2">
                          📎 {form.receiptFile.name}
                        </div>
                        {form.receiptFile.type.startsWith("image/") && (
                          <div className="border rounded p-2 bg-light">
                            <img
                              src={form.previewUrl}
                              alt="Receipt Preview"
                              className="img-fluid rounded"
                              style={{
                                maxHeight: "250px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        )}
                        {form.receiptFile.type === "application/pdf" && (
                          <div className="text-muted small fst-italic">
                            (ไฟล์นี้เป็น PDF — ไม่สามารถแสดงตัวอย่างได้)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
