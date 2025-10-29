import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

export default function UsageRateHistoryModal({ open, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (open) {
      const fetchHistory = async () => {
        try {
          const res = await api.get("/meter-rate");
          const data = Array.isArray(res.data) ? res.data : res.data.data || [];

          // แปลงชื่อประเภท + เรียงเวลาจากใหม่ไปเก่า
          const formatted = data
            .map((item) => ({
              timestamp: new Date(item.timestamp).toLocaleString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              type:
                item.type === "water"
                  ? "น้ำ"
                  : item.type === "electricity"
                  ? "ไฟฟ้า"
                  : item.type,
              rate: item.rate,
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

          setHistory(formatted);
        } catch (err) {
          console.error("Error fetching meter-rate history:", err);
        }
      };

      fetchHistory();
    }
  }, [open]);

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
              <h5 className="fw-bold mb-0">
                ประวัติการแก้ไขค่าน้ำ/ค่าไฟต่อหน่วย
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {history.length === 0 ? (
                <p className="text-center text-muted mb-0">
                  ไม่พบข้อมูลประวัติการแก้ไข
                </p>
              ) : (
                <div
                  style={{
                    maxHeight: "300px", // สูงสุดประมาณ 6 แถว
                    overflowY: "auto",
                  }}
                >
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table">
                      <tr>
                        <th>วันเวลาแก้ไข</th>
                        <th>ประเภท</th>
                        <th className="text-end">ราคาต่อหน่วย (บาท)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item, index) => (
                        <tr key={index}>
                          <td>{item.timestamp}</td>
                          <td>{item.type}</td>
                          <td className="text-end">
                            {item.rate?.toFixed(2) ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

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
