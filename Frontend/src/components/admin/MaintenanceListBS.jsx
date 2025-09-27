import React from 'react';

const chip = (s) =>
  s === 'completed' ? 'badge bg-success-subtle text-success-emphasis'
  : s === 'in_progress' ? 'badge bg-warning-subtle text-warning-emphasis'
  : s === 'scheduled' ? 'badge bg-info-subtle text-info-emphasis'
  : 'badge bg-danger-subtle text-danger-emphasis';

const text = (s) =>
  s === 'completed' ? 'ปิด'
  : s === 'in_progress' ? 'กำลังดำเนินการ'
  : s === 'scheduled' ? 'ตามแผน'
  : 'เปิด';

export default function MaintenanceListBS({ logs }) {
  return (
    <div
      className="vstack gap-2 p-2 rounded-3 bg-body custom-scroll"
      style={{ maxHeight: 200, overflowY: 'auto' }}  //  กล่อง scroll
    >
      {logs.map(item => (
        <div
          key={item.logId}
          className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-body-tertiary"
        >
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-tools text-secondary" />
            <div>
              <div className="fw-semibold">ห้อง {item.room?.roomNum || "-"}</div>
              <div className="text-secondary small">{item.description}</div>
            </div>
          </div>
          <span className={chip(item.status)}>{text(item.status)}</span>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-center text-secondary small py-2">
          ไม่มีรายการซ่อมบำรุง
        </div>
      )}
    </div>
  );
}
