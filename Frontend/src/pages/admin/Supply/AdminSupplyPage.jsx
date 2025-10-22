import React, { useState, useEffect } from "react";
import TableBS from "../../../components/admin/TableBS";
import SupplyFormModal from "./SupplyFormModal";
import SupplyManageModal from "./SupplyManageModal";

export default function AdminSupplyPage() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("list"); // "list" | "history"
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [history, setHistory] = useState([]);

  // โหลด mock data
  // โหลด mock data สิ่งของ
  useEffect(() => {
    const mockData = [
      { itemId: "ITM-001", name: "Light bulb", quantity: 0, status: "หมด" },
      { itemId: "ITM-002", name: "Pen", quantity: 120, status: "ปกติ" },
      { itemId: "ITM-003", name: "Water Pipe", quantity: 7, status: "ใกล้หมด" },
      {
        itemId: "ITM-004",
        name: "Toilet",
        quantity: null,
        status: "ปิดใช้งาน",
      },
    ];

    setTimeout(() => {
      setSupplies(mockData);
      setLoading(false);
    }, 400);
  }, []);

  // โหลด mock data ประวัติ
  useEffect(() => {
    const mockHistory = [
      {
        historyId: "HIT-001-001",
        itemId: "ITM-001",
        name: "Light bulb",
        quantity: 100,
        date: "2025-08-25",
        operator: "Kbtr",
        action: "คืน",
      },
      {
        historyId: "HIT-001-002",
        itemId: "ITM-002",
        name: "Pen",
        quantity: 120,
        date: "2025-08-25",
        operator: "PJ",
        action: "เติม",
      },
      {
        historyId: "HIT-001-003",
        itemId: "ITM-003",
        name: "Water Pipe",
        quantity: 7,
        date: "2025-08-25",
        operator: "Sukol",
        action: "เบิกใช้",
      },
      {
        historyId: "HIT-001-004",
        itemId: "ITM-004",
        name: "Toilet",
        quantity: "-",
        date: "2025-08-25",
        operator: "PJ",
        action: "เติม",
      },
    ];

    setHistory(mockHistory);
  }, []);

  // columns ของตาราง
  const columns = [
    { key: "itemId", label: "รหัสสิ่งของ" },
    { key: "name", label: "ชื่อ" },
    { key: "quantity", label: "จำนวนคงเหลือ" },
    { key: "status", label: "สถานะ" },
  ];

  const historyColumns = [
    { key: "historyId", label: "รหัสรายการ" },
    { key: "itemId", label: "รหัสสิ่งของ" },
    { key: "name", label: "ชื่อ" },
    { key: "quantity", label: "จำนวน" },
    { key: "date", label: "วันที่ทำรายการ" },
    { key: "operator", label: "ผู้ทำรายการ" },
    { key: "action", label: "ประเภทการทำรายการ" },
  ];

  const renderStatusBadge = (status) => {
    switch (status) {
      case "หมด":
        return <span className="badge bg-danger">หมด</span>;
      case "ใกล้หมด":
        return <span className="badge bg-warning">ใกล้หมด</span>;
      case "ปกติ":
        return <span className="badge bg-success">ปกติ</span>;
      case "ปิดใช้งาน":
        return <span className="badge bg-secondary">ปิดใช้งาน</span>;
      default:
        return status;
    }
  };

  const renderActionBadge = (action) => {
    switch (action) {
      case "เติม":
        return <span className="badge bg-success">เติม</span>;
      case "เบิกใช้":
        return <span className="badge bg-warning">เบิกใช้</span>;
      case "คืน":
        return <span className="badge bg-danger">คืน</span>;
      default:
        return action;
    }
  };

  // ฟิลเตอร์ฝั่งรายการสิ่งของ
  const listFilters = [
    {
      key: "status",
      label: "ทุกสถานะ",
      options: [
        { value: "หมด", label: "หมด" },
        { value: "ใกล้หมด", label: "ใกล้หมด" },
        { value: "ปกติ", label: "ปกติ" },
        { value: "ปิดใช้งาน", label: "ปิดใช้งาน" },
      ],
    },
  ];

  // ฟิลเตอร์ฝั่งประวัติ
  const historyFilters = [
    {
      key: "action",
      label: "ทุกประเภท",
      options: [
        { value: "เติม", label: "เติม" },
        { value: "เบิกใช้", label: "เบิกใช้" },
        { value: "คืน", label: "คืน" },
      ],
    },
    {
      key: "name",
      label: "ทุกสิ่งของ",
      options: [...new Set(history.map((h) => h.name))].map((name) => ({
        value: name,
        label: name,
      })),
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">คลังสิ่งของ</h3>
          <p className="text-muted mb-0">จัดการรายการสิ่งของของอาคาร</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelectedSupply(null);
            setFormOpen(true);
          }}
        >
          + สร้างบันทึกสิ่งของ
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "list" ? "active" : ""}`}
            onClick={() => setTab("list")}
          >
            รายการ
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === "history" ? "active" : ""}`}
            onClick={() => setTab("history")}
          >
            ประวัติ
          </button>
        </li>
      </ul>

      {/* Content */}
      {tab === "list" ? (
        <div className="card shadow-sm">
          <div className="card-header no-bg bg-light p-3 fw-bold">รายการสิ่งของ</div>
          <div className="card-body">
            <TableBS
              columns={columns}
              data={supplies.map((s) => ({
                ...s,
                quantity: s.quantity ?? "-",
                statusRaw: s.status,
                status: renderStatusBadge(s.status),
              }))}
              filters={listFilters}
              renderActions={(row) => (
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setSelectedSupply(row);
                    setManageOpen(true);
                  }}
                >
                  <i className="bi bi-search"></i>
                </button>
              )}
            />
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-header no-bg fw-bold bg-light p-3">
            ประวัติการจัดการสิ่งของ
          </div>
          <div className="card-body">
            <TableBS
              columns={historyColumns}
              data={history.map((h) => ({
                ...h,
                actionRaw: h.action,
                action: renderActionBadge(h.action),
              }))}
              filters={[
                {
                  key: "actionRaw",
                  label: "ทุกประเภท",
                  options: [
                    { value: "เติม", label: "เติม" },
                    { value: "เบิกใช้", label: "เบิกใช้" },
                    { value: "คืน", label: "คืน" },
                  ],
                },
                {
                  key: "name",
                  label: "ทุกสิ่งของ",
                  options: [...new Set(history.map((h) => h.name))].map(
                    (name) => ({ value: name, label: name })
                  ),
                },
              ]}
            />
          </div>
        </div>
      )}

      {/* Modal ฟอร์ม */}
      {formOpen && (
        <SupplyFormModal
          open={formOpen}
          supply={selectedSupply}
          onClose={() => setFormOpen(false)}
          onSuccess={() => console.log("saved!")}
        />
      )}

      <SupplyManageModal
        open={manageOpen}
        supply={selectedSupply}
        onClose={() => setManageOpen(false)}
        onSubmit={(data) => console.log("📦 บันทึกการจัดการ:", data)}
      />
    </div>
  );
}
