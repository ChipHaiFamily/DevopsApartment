import React, { useEffect, useState } from "react";
import api from "../../../api/axiosConfig";

export default function PaymentFormModal({ open, onClose, onSubmit }) {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().slice(0, 10),
    method: "",
    amount: "",
    fine: "-",
    receiptFile: null,
  });

  // ดึงใบแจ้งหนี้ที่ยังไม่ชำระ
  useEffect(() => {
    if (open) {
      api
        .get("/invoices")
        .then((res) => {
          const all = Array.isArray(res.data) ? res.data : res.data?.data || [];
          const unpaid = all.filter(
            (inv) => inv.status?.toLowerCase() !== "paid"
          );
          setInvoices(unpaid);
        })
        .catch((err) => console.error("Error fetching invoices:", err));
    }
  }, [open]);

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
    setForm((prev) => ({ ...prev, receiptFile: file || null }));
  };

  const handleSubmit = async () => {
    if (!selectedInvoice) {
      alert("กรุณาเลือกใบแจ้งหนี้ก่อน");
      return;
    }
    if (!form.method) {
      alert("กรุณาเลือกวิธีการชำระเงิน");
      return;
    }

    // ✅ ใช้ FormData เพื่อแนบไฟล์
    const payload = new FormData();
    payload.append("invoiceId", selectedInvoice.invoiceId);
    payload.append("paymentDate", form.paymentDate);
    payload.append("method", form.method);
    payload.append("amount", Number(form.amount || 0));
    payload.append("fine", form.fine === "-" ? 0 : Number(form.fine));

    if (form.receiptFile) {
      payload.append("receiptFile", form.receiptFile);
    }

    try {
      await api.post("/payments", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("บันทึกการชำระเงินสำเร็จ!");
      onClose();
    } catch (err) {
      console.error("Error uploading payment:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกการชำระเงิน");
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
              <div className="border rounded p-3">
                <h6 className="fw-bold mb-3">รายละเอียดการชำระ</h6>

                {/* ✅ ตารางแสดงยอด */}
                <table className="table table-sm align-middle">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">ชำระแล้วรวม</td>
                      <td className="text-end">
                        ฿{Number(form.amount || 0).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">ค้างชำระ</td>
                      <td className="text-end text-danger">
                        {selectedInvoice
                          ? `฿${(
                              selectedInvoice.totalAmount -
                              Number(form.amount || 0)
                            ).toLocaleString()}`
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">ค่าปรับ</td>
                      <td className="text-end">
                        {form.fine === "-" || form.fine === ""
                          ? "-"
                          : `฿${Number(form.fine).toLocaleString()}`}
                      </td>
                    </tr>
                    <tr className="table-light fw-bold">
                      <td>รวม</td>
                      <td className="text-end text-success">
                        {selectedInvoice
                          ? `฿${(
                              Number(form.amount || 0) +
                              (form.fine === "-" || form.fine === ""
                                ? 0
                                : Number(form.fine))
                            ).toLocaleString()}`
                          : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* ✅ ช่องกรอกข้อมูลเพิ่มเติม */}
                <div className="row g-3 mt-3">
                  <div className="col-md-4">
                    <label className="form-label">จำนวนเงินที่ชำระ</label>
                    <input
                      type="number"
                      className="form-control text-end"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">ค่าปรับ</label>
                    <input
                      type="number"
                      className="form-control text-end"
                      name="fine"
                      placeholder="-"
                      value={form.fine}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">วิธีการชำระเงิน</label>
                    <select
                      className="form-select"
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                    >
                      <option value="">-- เลือกวิธีชำระ --</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="PromptPay">PromptPay</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">วันที่ชำระ</label>
                    <input
                      type="date"
                      className="form-control"
                      name="paymentDate"
                      value={form.paymentDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      หลักฐานการชำระเงิน (ถ้ามี)
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                    {form.receiptFile && (
                      <div className="small text-success mt-1">
                        📎 {form.receiptFile.name}
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
