import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import InterestHistoryModal from "./InterestHistoryModal";

export default function InterestSettingModal({ open, onClose, onSaved }) {
  const [installmentInterest, setInstallmentInterest] = useState("");
  const [lateInterest, setLateInterest] = useState("");
  const [installmentDate, setInstallmentDate] = useState("");
  const [lateDate, setLateDate] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  // โหลดค่าดอกเบี้ยจาก backend
  useEffect(() => {
    const fetchInterestRates = async () => {
      try {
        const res = await api.get("/interest-rate/latest");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];

        const partial = data.find((r) => r.type === "partial");
        const unpaid = data.find((r) => r.type === "unpaid");

        if (partial) {
          setInstallmentInterest(partial.percentage);
          setInstallmentDate(
            new Date(partial.timestamp).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          );
        }
        if (unpaid) {
          setLateInterest(unpaid.percentage);
          setLateDate(
            new Date(unpaid.timestamp).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          );
        }
      } catch (err) {
        console.error("Error fetching interest rates:", err);
      }
    };

    if (open) fetchInterestRates();
  }, [open]);

  // ฟังก์ชันบันทึกข้อมูลใหม่
  const handleSaveInterest = async (type, value) => {
    try {
      await api.post("/interest-rate", {
        type,
        percentage: Number(value),
      });

      if (onSaved) onSaved();

      // onClose();
    } catch (err) {
      console.error("Error saving interest rate:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content" style={{ fontFamily: "Kanit" }}>
            <div className="modal-header">
              <h5 className="fw-bold mb-0">แก้ไขดอกเบี้ย</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="row">
                {/* ดอกเบี้ยแบ่งจ่าย */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">ดอกเบี้ยแบ่งจ่าย (%)</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      className="form-control text-end"
                      value={installmentInterest}
                      onChange={(e) => setInstallmentInterest(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={() =>
                        handleSaveInterest("partial", installmentInterest)
                      }
                    >
                      บันทึก
                    </button>
                  </div>
                  {installmentDate && (
                    <small className="text-muted">
                      อัปเดตล่าสุด: {installmentDate}
                    </small>
                  )}
                </div>

                {/* ดอกเบี้ยค้างชำระ */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">ดอกเบี้ยค้างชำระ (%)</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      className="form-control text-end"
                      value={lateInterest}
                      onChange={(e) => setLateInterest(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handleSaveInterest("unpaid", lateInterest)}
                    >
                      บันทึก
                    </button>
                  </div>
                  {lateDate && (
                    <small className="text-muted">
                      อัปเดตล่าสุด: {lateDate}
                    </small>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer d-flex justify-content-end">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                ปิด
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setHistoryOpen(true)}
              >
                ประวัติ
              </button>
            </div>
          </div>
        </div>

        <InterestHistoryModal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </div>
    </>
  );
}
