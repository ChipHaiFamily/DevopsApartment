import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";
import axios from "axios";
import Select from "react-select"; // ใช้ react-select เพื่อให้ค้นหาได้
import JSZip from "jszip"; //  สำหรับรวมไฟล์ PDF
import { saveAs } from "file-saver"; // สำหรับดาวน์โหลด ZIP

export default function InvoiceBulkPrintModal({ open, onClose }) {
  const [invoices, setInvoices] = useState([]);
  const [selectedList, setSelectedList] = useState([{ invoice: null }]);
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (open) {
      axios
        .get(`${baseURL}/invoices`)
        .then((res) => {
          setInvoices(
            Array.isArray(res.data) ? res.data : res.data?.invoices ?? []
          );
        })
        .catch((err) => console.error("Error fetching invoices:", err));
    }
  }, [open]);

  // ป้องกันเลือกซ้ำใบเดิม
  const selectedIds = selectedList
    .map((s) => s.invoice?.invoiceId)
    .filter(Boolean);

  const handleSelectChange = (index, invoiceObj) => {
    const newList = [...selectedList];
    newList[index].invoice = invoiceObj?.value || null;
    setSelectedList(newList);
  };

  const handleAddSelect = () => {
    setSelectedList([...selectedList, { invoice: null }]);
  };

  const handleRemoveSelect = (index) => {
    const updated = selectedList.filter((_, i) => i !== index);
    setSelectedList(updated.length > 0 ? updated : [{ invoice: null }]);
  };

  // Export เป็น ZIP โฟลเดอร์รวม
  const handleExportAll = async () => {
    const validInvoices = selectedList
      .map((s) => s.invoice)
      .filter((i) => i && i.invoiceId);

    if (validInvoices.length === 0) return;

    const zip = new JSZip();

    for (const inv of validInvoices) {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("INVOICE", 14, 20);

      // QR พร้อมเพย์
      const phoneNumber = "0876470150";
      const payload = generatePayload(phoneNumber, { amount: inv.totalAmount });
      const qrImage = await QRCode.toDataURL(payload);
      doc.addImage(qrImage, "PNG", 150, 20, 40, 40);
      doc.text("QR PromptPay", 158, 65);

      // ข้อมูลใบแจ้งหนี้
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${inv.invoiceId}`, 14, 30);
      doc.text(`Tenant: ${inv.tenant?.user?.fullName || "-"}`, 14, 37);
      doc.text(
        `Room: ${inv.tenant?.contract?.[0]?.room?.roomNum || "-"}`,
        14,
        44
      );
      doc.text(`Issue Date: ${inv.issueDate}`, 14, 51);
      doc.text(`Due Date: ${inv.dueDate}`, 14, 58);
      doc.text(`Status: ${inv.status || "-"}`, 14, 65);

      // ตาราง
      autoTable(doc, {
        startY: 75,
        head: [["Description", "Amount"]],
        body:
          inv.items?.map((it) => [
            it.description,
            `฿${it.amount.toLocaleString()}`,
          ]) || [],
        foot: [["Total", `฿${inv.totalAmount.toLocaleString()}`]],
        styles: { font: "helvetica", fontSize: 11 },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.1,
      });

      // แปลง PDF เป็น blob แล้วใส่ ZIP
      const pdfBlob = doc.output("blob");
      zip.file(`Invoice-${inv.invoiceId}.pdf`, pdfBlob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `Invoices-${new Date().toISOString().slice(0, 10)}.zip`);

    // ปิด modal หลังบันทึก
    onClose();
  };

  if (!open) return null;

  const selectOptions = invoices.map((inv) => {
    let statusText = "ไม่ทราบสถานะ";
    if (inv.status === "Paid") statusText = "ชำระแล้ว";
    else if (inv.status === "Overdue") statusText = "เกินกำหนด";
    else if (inv.status === "Pending") statusText = "รอดำเนินการ";
    else if (inv.status === "Partial") statusText = "แบ่งจ่ายบางส่วน";

    return {
      label: `${inv.invoiceId} (ห้อง ${
        inv.tenant?.contract?.[0]?.room?.roomNum || "-"
      }) — ${statusText}`,
      value: inv,
    };
  });

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content" style={{ fontFamily: "Kanit" }}>
            <div className="modal-header">
              <h5 className="fw-bold">ส่งออกใบแจ้งหนี้หลายชุด</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {selectedList.map((sel, index) => (
                <div key={index} className="card mb-3 p-3 border">
                  {/* Select ค้นหาได้ */}
                  <label className="fw-semibold mb-2">เลขที่ใบแจ้งหนี้</label>
                  <Select
                    options={invoices.map((inv) => {
                      // ตรวจว่าถูกเลือกไปแล้วใน select อื่นหรือไม่
                      const alreadySelected = selectedList.some(
                        (s, i) =>
                          i !== index && s.invoice?.invoiceId === inv.invoiceId
                      );

                      let statusText = "ไม่ทราบสถานะ";
                      if (inv.status === "Paid") statusText = "ชำระแล้ว";
                      else if (inv.status === "Overdue")
                        statusText = "เกินกำหนด";
                      else if (inv.status === "Pending")
                        statusText = "รอดำเนินการ";
                      else if (inv.status === "Partial")
                        statusText = "แบ่งจ่ายบางส่วน";

                      return {
                        label: `${inv.invoiceId} (ห้อง ${
                          inv.tenant?.contract?.[0]?.room?.roomNum || "-"
                        }) — ${statusText}`,
                        value: inv,
                        isDisabled: alreadySelected, // ✅ ปิด option ที่เลือกซ้ำในช่องอื่น
                      };
                    })}
                    placeholder="พิมพ์เพื่อค้นหาใบแจ้งหนี้..."
                    value={
                      sel.invoice
                        ? {
                            label: `${sel.invoice.invoiceId} (ห้อง ${
                              sel.invoice.tenant?.contract?.[0]?.room
                                ?.roomNum || "-"
                            }) `,
                            value: sel.invoice,
                          }
                        : null
                    }
                    onChange={(option) => handleSelectChange(index, option)}
                    isClearable
                    isSearchable
                    menuPortalTarget={document.body} // ป้องกันปิด modal ตอนคลิก scroll
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isDisabled
                          ? "#f2f2f2"
                          : state.isFocused
                          ? "#e9ecef"
                          : "white",
                        color: state.isDisabled ? "#999" : "black",
                      }),
                    }}
                  />

                  {/* ข้อมูลใบแจ้งหนี้ */}
                  {sel.invoice && (
                    <div className="border rounded p-3 mt-3">
                      <p>
                        ห้อง:{" "}
                        {sel.invoice.tenant?.contract?.[0]?.room?.roomNum ||
                          "-"}
                      </p>
                      <p>
                        ผู้เช่า: {sel.invoice.tenant?.user?.fullName || "-"}
                      </p>
                      <p>วันที่ออกบิล: {sel.invoice.issueDate}</p>
                      <p>กำหนดชำระ: {sel.invoice.dueDate}</p>
                      <p>
                        สถานะการชำระเงิน:{" "}
                        <span
                          className={`badge ${
                            sel.invoice.status === "Paid"
                              ? "bg-success"
                              : sel.invoice.status === "Overdue"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {sel.invoice.status || "Pending"}
                        </span>
                      </p>

                      {/* ตารางค่าใช้จ่าย */}
                      <table className="table table-sm mt-2">
                        <thead>
                          <tr>
                            <th>รายการ</th>
                            <th className="text-end">จำนวนเงิน</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sel.invoice.items?.map((it, i) => (
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
                              ฿{sel.invoice.totalAmount.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline-danger mt-3"
                    onClick={() => handleRemoveSelect(index)}
                  >
                    ลบ
                  </button>
                </div>
              ))}

              <button
                className="btn btn-outline-primary mt-2"
                onClick={handleAddSelect}
              >
                + เลือกเพิ่ม
              </button>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ยกเลิก
              </button>
              <button
                className="btn btn-primary"
                onClick={handleExportAll}
                disabled={
                  selectedList.filter((s) => s.invoice?.invoiceId).length === 0
                }
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
