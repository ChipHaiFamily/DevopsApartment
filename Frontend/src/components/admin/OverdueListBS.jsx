import React from 'react';

export default function OverdueListBS({ invoices }) {
  const pending = invoices?.filter(i => i.status === 'pending') ?? [];

  return (
    <div
      className="vstack gap-2 p-2 bg-body custom-scroll"
      style={{ maxHeight: 200, overflowY: 'auto' }}  // กล่อง scroll
    >
      {pending.map(inv => (
        <div
          key={inv.invoiceId}
          className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-danger-subtle"
        >
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-receipt text-danger-emphasis" />
            <div>
              <div className="fw-semibold">
                ห้อง {inv.contractNum?.split('-').slice(-1)[0]}
              </div>
              <div className="small text-danger-emphasis">
                ฿{inv.totalAmount != null ? inv.totalAmount.toLocaleString() : "-"} • ครบกำหนด {inv.dueDate}
              </div>
            </div>
          </div>
          <span className="badge rounded-pill bg-danger text-white">ค้าง</span>
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
