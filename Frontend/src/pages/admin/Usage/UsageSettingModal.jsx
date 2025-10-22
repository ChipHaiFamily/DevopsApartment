import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import UsageRateHistoryModal from "./UsageRateHistoryModal";

export default function UsageSettingModal({ open, onClose }) {
  const [waterRate, setWaterRate] = useState("");
  const [electricRate, setElectricRate] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  // โหลดค่าปัจจุบันจาก backend (mock ก่อน)
  useEffect(() => {
    if (open) {
      // ตัวอย่าง mock data — ถ้ามี API จริง ให้ใช้ api.get("/settings/usage")
      setWaterRate("0.66");
      setElectricRate("1.25");
    }
  }, [open]);

  const handleSaveWater = async () => {
    try {
      await api.put("/settings/usage/water", { value: Number(waterRate) });
      alert("บันทึกราคาน้ำสำเร็จ");
    } catch (err) {
      console.error("Error saving water rate:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกราคาน้ำ");
    }
  };

  const handleSaveElectric = async () => {
    try {
      await api.put("/settings/usage/electricity", {
        value: Number(electricRate),
      });
      alert("บันทึกราคาไฟสำเร็จ");
    } catch (err) {
      console.error("Error saving electricity rate:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกราคาไฟ");
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
              <h5 className="fw-bold mb-0">แก้ไขค่าน้ำ/ค่าไฟต่อหน่วย</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="row">
                {/* น้ำ */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    ราคาน้ำต่อหน่วย
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control text-end"
                      value={waterRate}
                      onChange={(e) => setWaterRate(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleSaveWater}
                    >
                      บันทึก
                    </button>
                  </div>
                </div>

                {/* ไฟ */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    ราคาไฟต่อหน่วย
                  </label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control text-end"
                      value={electricRate}
                      onChange={(e) => setElectricRate(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleSaveElectric}
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

        <UsageRateHistoryModal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </div>
    </>
  );
}
