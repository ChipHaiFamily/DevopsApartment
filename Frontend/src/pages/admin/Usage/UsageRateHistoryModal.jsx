import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

export default function UsageRateHistoryModal({ open, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (open) {
      // mock data — ถ้ามี API จริงใช้ api.get("/settings/usage/history")
      const mockData = [
        {
          timestamp: "2025-06-02 17:32:11",
          type: "น้ำ",
          rate: 4,
        },
        {
          timestamp: "2025-06-02 17:32:11",
          type: "ไฟฟ้า",
          rate: 7,
        },
      ];
      setHistory(mockData);
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
              <h5 className="fw-bold mb-0">ประวัติการแก้ไขค่าน้ำ/ค่าไฟต่อหน่วย</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <table className="table table-sm align-middle">
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
                      <td className="text-end">{item.rate.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
