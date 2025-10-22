import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr"; // ใช้ lib นี้แปลงเบอร์เป็น QR string

export default function InvoiceDetailModal({ open, onClose, invoice, onEdit }) {
  if (!open || !invoice) return null;

  const handleExportPDF = async () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("INVOICE", 14, 20);

    // PromptPay QR
    const phoneNumber = "0876470150"; // เบอร์พร้อมเพย์
    const amount = invoice.totalAmount; // ยอดจากใบแจ้งหนี้
    const payload = generatePayload(phoneNumber, { amount }); // สร้าง string พร้อมเพย์
    const qrImage = await QRCode.toDataURL(payload); // แปลงเป็น base64 image

    // แทรก QR ลงใน PDF
    doc.addImage(qrImage, "PNG", 150, 20, 40, 40);
    doc.text("QR PromptPay", 158, 65);

    // Invoice info
    doc.setFontSize(12);
    doc.text(`Invoice ID: ${invoice.invoiceId}`, 14, 30);
    doc.text(`Tenant: ${invoice.tenant?.user?.fullName || "-"}`, 14, 37);
    doc.text(
      `Room: ${invoice.tenant?.contract?.[0]?.room?.roomNum || "-"}`,
      14,
      44
    );
    doc.text(`Issue Date: ${invoice.issueDate}`, 14, 51);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 58);

    // Items table
    autoTable(doc, {
      startY: 75,
      head: [["Description", "Amount"]],
      body:
        invoice.items?.map((item) => [
          item.description,
          `$${item.amount.toLocaleString()}`,
        ]) || [],
      foot: [["Total", `$${invoice.totalAmount.toLocaleString()}`]],
      styles: { font: "helvetica", fontSize: 11 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Payments table
    if (invoice.payments?.length > 0) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Date", "Method", "Amount"]],
        body: invoice.payments.map((p) => [
          p.paymentDate,
          p.method,
          `$${p.amount.toLocaleString()}`,
        ]),
        styles: { font: "helvetica", fontSize: 11 },
        headStyles: { fillColor: [39, 174, 96] },
      });
    }

    // Save file
    doc.save(`Invoice-${invoice.invoiceId}.pdf`);
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show d-block"
        data-testid="invoice-detail-modal"
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
              <h5 className="modal-title fw-bold">รายละเอียดใบแจ้งหนี้</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Invoice summary */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">เลขที่ใบแจ้งหนี้</label>
                  <input
                    className="form-control"
                    value={invoice.invoiceId}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">สถานะ</label>
                  <input
                    className="form-control"
                    value={invoice.status}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">วันที่ออกบิล</label>
                  <input
                    className="form-control"
                    value={invoice.issueDate}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">กำหนดชำระ</label>
                  <input
                    className="form-control"
                    value={invoice.dueDate}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ผู้เช่า</label>
                  <input
                    className="form-control"
                    value={invoice.tenant?.user?.fullName || "-"}
                    readOnly
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ห้อง</label>
                  <input
                    className="form-control"
                    value={invoice.tenant?.contract?.room?.roomNum || "-"}
                    readOnly
                  />
                </div>
              </div>

              {/* Items */}
              <h6 className="fw-bold mt-3">รายละเอียดค่าใช้จ่าย</h6>
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>รายการ</th>
                    <th className="text-end">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item) => (
                    <tr key={item.itemId}>
                      <td>{item.description}</td>
                      <td className="text-end">
                        ฿{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="fw-bold">
                    <td>รวม</td>
                    <td className="text-end">
                      ฿{invoice.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Payments */}
              <h6 className="fw-bold mt-3">การชำระเงิน</h6>
              {invoice.payments?.length > 0 ? (
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>วันที่</th>
                      <th>วิธีชำระ</th>
                      <th className="text-end">จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((pay) => (
                      <tr key={pay.paymentId}>
                        <td>{pay.paymentDate}</td>
                        <td>{pay.method}</td>
                        <td className="text-end">
                          ฿{pay.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-secondary fst-italic">
                  ยังไม่มีการชำระเงิน
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ปิด
              </button>
              <button className="btn btn-success" onClick={handleExportPDF}>
                Save as PDF
              </button>
              <button className="btn btn-primary" onClick={onEdit}>
                แก้ไข
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
