import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import UsageRateHistoryModal from "./UsageRateHistoryModal";

export default function UsageSettingModal({ open, onClose }) {
  const [waterRate, setWaterRate] = useState("");
  const [electricRate, setElectricRate] = useState("");
  const [waterDate, setWaterDate] = useState("");
  const [electricDate, setElectricDate] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  

  // โหลดค่าปัจจุบันจาก backend
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get("/meter-rate/latest");
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];

        // หาค่าล่าสุดของน้ำและไฟตาม timestamp ล่าสุด
        const latestWater = data
          .filter((r) => r.type === "water")
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

        const latestElectric = data
          .filter((r) => r.type === "electricity")
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

        if (latestWater) {
          setWaterRate(latestWater.rate);
          setWaterDate(
            new Date(latestWater.timestamp).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          );
        }

        if (latestElectric) {
          setElectricRate(latestElectric.rate);
          setElectricDate(
            new Date(latestElectric.timestamp).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          );
        }
      } catch (err) {
        console.error("Error fetching meter rate:", err);
      }
    };

    if (open) fetchRates();
  }, [open]);

  // ฟังก์ชันบันทึก
  const handleSaveRate = async (type, rate) => {
    try {
      await api.post("/meter-rate", { type, rate: Number(rate) });
      alert(`บันทึกราคา${type === "water" ? "น้ำ" : "ไฟ"}สำเร็จ`);
      onClose(); // ปิด modal หลังบันทึก
    } catch (err) {
      console.error("Error saving rate:", err);
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
                      onClick={() => handleSaveRate("water", waterRate)}
                    >
                      บันทึก
                    </button>
                  </div>
                  {waterDate && (
                    <small className="text-muted">
                      อัปเดตล่าสุด: {waterDate}
                    </small>
                  )}
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
                      onClick={() => handleSaveRate("electricity", electricRate)}
                    >
                      บันทึก
                    </button>
                  </div>
                  {electricDate && (
                    <small className="text-muted">
                      อัปเดตล่าสุด: {electricDate}
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

        <UsageRateHistoryModal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </div>
    </>
  );
}
