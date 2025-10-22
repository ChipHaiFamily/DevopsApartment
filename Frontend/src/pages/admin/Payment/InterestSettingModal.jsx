import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import InterestHistoryModal from "./InterestHistoryModal";

export default function InterestSettingModal({ open, onClose }) {
  const [installmentInterest, setInstallmentInterest] = useState("");
  const [lateInterest, setLateInterest] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  // หลดค่าปัจจุบันจาก backend (mock ไว้ก่อน)
  useEffect(() => {
    if (open) {
      // ตัวอย่าง mock ถ้ามี API จริง ให้ใช้ api.get("/settings/interest")
      setInstallmentInterest("0.66");
      setLateInterest("1.25");
    }
  }, [open]);

  const handleSaveInstallment = async () => {
    try {
      await api.put("/settings/interest/installment", {
        value: Number(installmentInterest),
      });
      alert("บันทึกดอกเบี้ยแบ่งจ่ายสำเร็จ");
    } catch (err) {
      console.error("Error saving installment interest:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกดอกเบี้ยแบ่งจ่าย");
    }
  };

  const handleSaveLate = async () => {
    try {
      await api.put("/settings/interest/late", {
        value: Number(lateInterest),
      });
      alert("บันทึกดอกเบี้ยค้างชำระสำเร็จ");
    } catch (err) {
      console.error("Error saving late interest:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกดอกเบี้ยค้างชำระ");
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
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    ดอกเบี้ยแบ่งจ่าย
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control text-end"
                      style={{ whiteSpace: "nowrap" }}
                      value={installmentInterest}
                      onChange={(e) => setInstallmentInterest(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleSaveInstallment}
                    >
                      บันทึก
                    </button>
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    ดอกเบี้ยค้างชำระ
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control text-end"
                      style={{ whiteSpace: "nowrap" }}
                      value={lateInterest}
                      onChange={(e) => setLateInterest(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleSaveLate}
                    >
                      บันทึก
                    </button>
                  </div>
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
