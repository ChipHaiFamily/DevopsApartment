import React, { useState, useEffect } from "react";
import TableBS from "../../../components/admin/TableBS";
import SupplyFormModal from "./SupplyFormModal";
import SupplyManageModal from "./SupplyManageModal";
import api from "../../../api/axiosConfig";

export default function AdminSupplyPage() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("list"); // "list" | "history"
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchSupplies = async () => {
    try {
      const res = await api.get("/supplies");
      if (Array.isArray(res.data)) {
        setSupplies(res.data);
      } else if (res.data?.data) {
        setSupplies(res.data.data);
      } else {
        setSupplies([]);
      }
    } catch (err) {
      console.error("Error fetching supplies:", err);
      showToast("โหลดข้อมูลสิ่งของไม่สำเร็จ", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/supplies-history");
      if (Array.isArray(res.data)) {
        setHistory(res.data);
      } else if (res.data?.data) {
        setHistory(res.data.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error fetching supplies history:", err);
      showToast("โหลดประวัติการจัดการสิ่งของไม่สำเร็จ", "danger");
    }
  };

  useEffect(() => {
    fetchSupplies();
    fetchHistory();
  }, []);

  const translateStatus = (status) => {
    switch (status) {
      case "In Stock":
        return "ปกติ";
      case "in stock":
        return "ปกติ";
      case "Low Stock":
        return "ใกล้หมด";
      case "Out of Stock":
        return "หมด";
      case "Out of Service":
        return "ปิดใช้งาน";
      default:
        return status;
    }
  };

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
      key: "actionRaw",
      label: "ทุกประเภท",
      options: [
        { value: "restock", label: "เติม" },
        { value: "withdraw", label: "เบิกใช้" },
        { value: "return", label: "คืน" },
      ],
    },
    {
      key: "name",
      label: "ทุกสิ่งของ",
      options: [...new Set(history.map((h) => h.item_Name))].map((name) => ({
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
          <div className="card-header no-bg bg-light p-3 fw-bold">
            รายการสิ่งของ
          </div>
          <div className="card-body">
            <TableBS
              columns={columns}
              data={supplies.map((s) => ({
                itemId: s.itemId,
                name: s.item_Name,
                quantity: s.quantity ?? "-",
                status: renderStatusBadge(translateStatus(s.status)),
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
                historyId: h.historyId,
                itemId: h.itemId,
                name: h.item_Name,
                quantity: h.quantity ?? "-",
                date: h.date,
                operator: h.operator,
                actionRaw: h.action,
                action: renderActionBadge(
                  h.action === "restock"
                    ? "เติม"
                    : h.action === "withdraw"
                    ? "เบิกใช้"
                    : h.action === "return"
                    ? "คืน"
                    : h.action
                ),
              }))}
              filters={historyFilters}
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
          onSuccess={(success, message) => {
            setFormOpen(false);
            fetchSupplies();
            if (success) {
              showToast(message || "เพิ่มสิ่งของใหม่เรียบร้อยแล้ว!", "success");
            } else {
              showToast(message || "ไม่สามารถเพิ่มสิ่งของได้", "danger");
            }
          }}
          supplies={supplies}
        />
      )}

      <SupplyManageModal
        open={manageOpen}
        supply={selectedSupply}
        onClose={() => setManageOpen(false)}
        onSubmit={() => {
          fetchSupplies(); // รีโหลดตารางหลัก (ถ้ามีการอัปเดตจำนวน)
          fetchHistory(); // รีโหลดตารางประวัติทันที
          showToast("บันทึกการจัดการสิ่งของสำเร็จ!", "success");
        }}
      />

      {/* ===== Toast แจ้งผล ===== */}
      {toast.show && (
        <div
          className={`toast align-items-center text-bg-${toast.type} border-0 show position-fixed top-0 end-0 m-3`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ zIndex: 1055 }}
        >
          <div className="d-flex">
            <div className="toast-body">{toast.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              onClick={() => setToast({ show: false, message: "", type: "" })}
            ></button>
          </div>
        </div>
      )}
    </div>
  );
}
