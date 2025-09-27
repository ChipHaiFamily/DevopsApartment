import React from 'react';

/**
 * props:
 * - title?: string                 // ชื่อหัวกล่อง (default: 'เมนูด่วน')
 * - items: Array<{                 // รายการปุ่ม
 *      label: string,
 *      variant?: 'blue'|'amber',   // โทนปุ่ม
 *      icon?: string,              // class ของ bootstrap-icons เช่น 'bi bi-people'
 *      onClick?: () => void
 *   }>
 */
export default function QuickMenuCard({
  title = 'เมนูด่วน',
  items = [],
}) {
  return (
    <div className="card qm-card">
      <div className="card-header bg-white border-0">
        <div className="fw-bold">{title}</div>
      </div>
      <div className="card-body pt-0">
        <div className="vstack gap-2">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={it.onClick}
              className={`btn w-100 fw-bold d-flex align-items-center justify-content-center qm-btn ${
                it.variant === 'amber' ? 'qm-btn-amber' : 'qm-btn-blue'
              }`}
            >
              {it.icon && <i className={`${it.icon} me-2`} />}
              {it.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}