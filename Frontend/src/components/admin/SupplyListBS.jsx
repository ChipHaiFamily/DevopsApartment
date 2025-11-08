import React from "react";

export default function SupplyListBS({ items }) {
  // กรองเฉพาะรายการที่ Low Stock หรือ Out of Stock
  const supply =
    items?.filter((item) =>
      ["Low Stock", "Out of Stock"].includes(item.status)
    ) ?? [];

  return (
    <div
      className="vstack gap-2 p-2 bg-body custom-scroll"
      style={{ height: 180, overflowY: "auto" }}
    >
      {supply.map((item) => (
        <div
          key={item.itemId}
          className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light-subtle"
        >
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-box-seam text-primary-emphasis" />
            <div>
              <div className="fw-semibold">{item.name}</div>
              <div className="small text-secondary">
                คงเหลือ: {item.quantity ?? 0} 
              </div>
            </div>
          </div>

          {/* สี badge ตามสถานะ */}
          {item.status === "Low Stock" && (
            <span className="badge rounded-pill bg-warning">
              เหลือน้อย
            </span>
          )}
          {item.status === "Out of Stock" && (
            <span className="badge rounded-pill bg-danger">หมด</span>
          )}
        </div>
      ))}

      {supply.length === 0 && (
        <div className="text-center text-secondary small py-2">
          ไม่มีสิ่งของเหลทอน้อยหรือหมด
        </div>
      )}
    </div>
  );
}
