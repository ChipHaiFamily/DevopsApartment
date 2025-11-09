import React from 'react';

export default function OverdueListBS({ invoices }) {
  // รองรับทั้ง pending และ Overdue
  const pending =
    invoices?.filter(i =>
      ["pending", "overdue", "Overdue"].includes(i.status)
    ) ?? [];

  return (
    <div
      className="vstack gap-2 p-2 bg-body custom-scroll"
      style={{ height: 180, overflowY: "auto" }}
    >
      {pending.map(inv => (
        <div
          key={inv.invoiceId}
          className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-body-tertiary"
        >
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-receipt text-danger-emphasis" />
            <div>
              <div className="fw-semibold">
                ห้อง {inv.tenant?.contract?.[0]?.room?.roomNum || "-"}
              </div>
              <div className="small text-danger-emphasis">
                ฿{inv.totalAmount != null ? inv.totalAmount.toLocaleString() : "-"} • เกินกำหนดเมื่อ {inv.dueDate || "-"}
              </div>
            </div>
          </div>
          <span className="badge rounded-pill bg-danger text-white">
            ค้างชำระ
          </span>
        </div>
      ))}

      {pending.length === 0 && (
        <div className="text-center text-secondary small py-2">
          ไม่มีใบแจ้งหนี้ค้างชำระ
        </div>
      )}
    </div>
  );
}
