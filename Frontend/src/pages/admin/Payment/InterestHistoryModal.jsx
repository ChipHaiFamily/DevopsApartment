import React, { useState, useEffect } from "react";
import api from "../../../api/axiosConfig";

export default function InterestHistoryModal({ open, onClose }) {
  const [history, setHistory] = useState([]);

  // โหลดข้อมูล mockup
  useEffect(() => {
    if (open) {
      // ตัวอย่าง mock data
      const mockData = [
        {
          timestamp: "2025-06-02 17:32:11",
          type: "Partial",
          percent: 0.5,
        },
        {
          timestamp: "2025-06-02 17:32:11",
          type: "Unpaid",
          percent: 1.1,
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
              <h5 className="fw-bold mb-0">ประวัติการแก้ไขดอกเบี้ย</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <table className="table table-sm align-middle">
                <thead className="table">
                  <tr>
                    <th>วันเวลาแก้ไข</th>
                    <th>ประเภท</th>
                    <th className="text-end">เปอร์เซ็นต์</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index}>
                      <td>{item.timestamp}</td>
                      <td>{item.type}</td>
                      <td className="text-end">{item.percent}</td>
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
