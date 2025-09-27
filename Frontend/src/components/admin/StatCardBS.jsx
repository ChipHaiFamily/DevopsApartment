import React from 'react';

export default function StatCardBS({ icon, label, value, hint }) {
  return (
    <div className="card card-soft h-100">
      <div className="card-body d-flex">
        <div className="me-3 d-flex align-items-start justify-content-center">
          <div className="stat-icon">
            {icon ?? <span className="bi bi-building"></span>}
          </div>
        </div>
        <div>
          <div className="text-secondary small fw-semibold">{label}</div>
          <div className="fs-4 fw-bold text-dark">{value}</div>
          {hint && <div className="small text-success fw-semibold">{hint}</div>}
        </div>
      </div>
    </div>
  );
}