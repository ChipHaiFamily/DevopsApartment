import React from "react";

export default function TenantDetailModal({ open, onClose, tenant }) {
  if (!open || !tenant) return null;

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
            style={{ fontFamily: "Kanit, system-ui, sans-serif", maxHeight: "80vh" }}
          >
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">รายละเอียดผู้เช่า</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body (scrollable) */}
            <div className="modal-body overflow-auto" style={{ maxHeight: "65vh" }}>
              {/* Tenant Info */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">รหัสผู้เช่า</label>
                  <input className="form-control" value={tenant.tenantId} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ชื่อ-นามสกุล</label>
                  <input className="form-control" value={tenant.name} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">เพศ</label>
                  <input className="form-control" value={tenant.sex} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">สถานะปัจจุบัน</label>
                  <input className="form-control" value={tenant.currentStatus} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">อีเมล</label>
                  <input className="form-control" value={tenant.email} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">เบอร์โทร</label>
                  <input className="form-control" value={tenant.phone} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">อาชีพ</label>
                  <input className="form-control" value={tenant.job} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">สถานที่ทำงาน</label>
                  <input className="form-control" value={tenant.workplace} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ผู้ติดต่อฉุกเฉิน</label>
                  <input className="form-control" value={tenant.emergencyName} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">เบอร์ฉุกเฉิน</label>
                  <input className="form-control" value={tenant.emergencyContact} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">ความสัมพันธ์</label>
                  <input className="form-control" value={tenant.emergencyRelationship} readOnly />
                </div>
              </div>

              {/* Contracts */}
              <h6 className="fw-bold mt-3">สัญญาเช่าทั้งหมด</h6>
              {tenant.contracts?.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {tenant.contracts.map((c) => (
                    <div key={c.contractNum} className="card shadow-sm border-0">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="fw-bold mb-0">เลขที่สัญญา: {c.contractNum}</h6>
                          <span
                            className={`badge ${
                              c.status === "active"
                                ? "bg-success"
                                : c.status === "expired"
                                ? "bg-danger"
                                : "bg-warning"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <p className="mb-1">
                          <strong>ห้อง:</strong> {c.roomNumber}
                        </p>
                        <p className="mb-1">
                          <strong>วันเริ่ม:</strong> {c.startDate}
                        </p>
                        <p className="mb-1">
                          <strong>วันสิ้นสุด:</strong> {c.endDate}
                        </p>
                        <p className="mb-1">
                          <strong>ค่าเช่า:</strong> ฿{c.rentAmount.toLocaleString()}
                        </p>
                        <p className="mb-1">
                          <strong>เงินประกัน:</strong> ฿{c.deposit.toLocaleString()}
                        </p>
                        <p className="mb-0">
                          <strong>รอบบิล:</strong> {c.billingCycle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-secondary fst-italic">
                  ยังไม่มีสัญญาเช่า
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
