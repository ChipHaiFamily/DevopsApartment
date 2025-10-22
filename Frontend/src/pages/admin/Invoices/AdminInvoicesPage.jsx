import React, { useEffect, useState } from "react";
import axios from "axios";
// import data from "../../data.json";
import StatCardBS from "../../../components/admin/StatCardBS";
import TableBS from "../../../components/admin/TableBS";
import InvoiceDetailModal from "./InvoiceDetailModal";
import InvoiceFormModal from "./InvoiceFormModal";

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // modal ดูรายละเอียด
  const [editingInvoice, setEditingInvoice] = useState(null); // modal create/update
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  // console.log("Calling API:", `${baseURL}/invoices`);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseURL}/invoices`);
      setInvoices(Array.isArray(res.data) ? res.data : res.data.invoices || []);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchInvoices();
  }, [baseURL]);

  // Metrics
  const totalAmount = invoices.reduce(
    (sum, i) => sum + Number(i.totalAmount || 0),
    0
  );
  const pendingAmount = invoices
    .filter((i) => i.status !== "Paid")
    .reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
  const totalInvoices = invoices.length;
  const overdue = invoices.filter((i) => {
    const due = new Date(i.dueDate);
    return i.status !== "Paid" && due < new Date();
  }).length;

  const getLatestContract = (contracts) => {
    if (!Array.isArray(contracts) || contracts.length === 0) return null;
    return contracts.reduce((latest, current) => {
      return new Date(current.endDate) > new Date(latest.endDate)
        ? current
        : latest;
    });
  };

  const normalizedInvoices = invoices.map((inv) => {
    const contract = getLatestContract(inv.tenant?.contract);

    return {
      invoiceId: inv.invoiceId,
      tenantName: inv.tenant?.user?.fullName || "ไม่ระบุ",
      roomNum: contract?.room?.roomNum || "-",
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      totalAmount: `฿${inv.totalAmount?.toLocaleString() || 0}`,
      status: inv.status,
      floor: contract?.room?.floor ? `${contract.room.floor}` : "-",
    };
  });

  const columns = [
    { key: "invoiceId", label: "เลขที่ใบแจ้งหนี้" },
    { key: "floor", label: "ชั้น" },
    { key: "roomNum", label: "ห้อง" },
    { key: "tenantName", label: "ผู้เช่า" },
    { key: "issueDate", label: "วันที่ออกบิล" },
    { key: "totalAmount", label: "ยอดรวม" },
    { key: "dueDate", label: "กำหนดชำระ" },
    { key: "status", label: "สถานะ" },
  ];

  const filters = [
    {
      key: "floor",
      label: "ทุกชั้น",
      options: [
        { value: "1", label: "ชั้น 1" },
        { value: "2", label: "ชั้น 2" },
      ],
    },
    {
      key: "status",
      label: "ทุกสถานะ",
      options: [
        { value: "Paid", label: "ชำระแล้ว" },
        { value: "Pending", label: "รอดำเนินการ" },
        { value: "Overdue", label: "เกินกำหนด" },
        { value: "Partial", label: "เกินกำหนด" },
      ],
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
          <h3 className="mb-0">ใบแจ้งหนี้</h3>
          <p className="text-muted mb-0">
            จัดการใบแจ้งหนี้และติดตามสถานะการชำระเงิน
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-light text-primary me-2"
          >
            ส่งออกหลายชุด
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCreatingInvoice(true)}
          >
            + สร้างใบแจ้งหนี้ใหม่
          </button>
        </div>
      </div>

      {/* เมทริก */}
      <div className="row g-3 mb-2">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="รายได้รวม"
            value={`฿${totalAmount.toLocaleString()}`}
            icon={<i className="bi bi-file-earmark-text-fill text-success"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="รอชำระ"
            value={`฿${pendingAmount.toLocaleString()}`}
            icon={<i className="bi bi-file-earmark-text-fill text-warning"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="บิลทั้งหมด"
            value={totalInvoices}
            fe
            icon={<i className="bi bi-file-earmark-text-fill"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="เกินกำหนด"
            value={overdue}
            icon={<i className="bi bi-file-earmark-text-fill text-danger"></i>}
          />
        </div>
      </div>

      {/* ตารางบิล */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center p-3">
          <span>ใบแจ้งหนี้</span>
        </div>

        <div className="card-body">
          <TableBS
            columns={columns}
            data={normalizedInvoices}
            filters={filters}
            renderCell={(key, value) =>
              key === "status" ? (
                value === "Paid" ? (
                  <span className="badge bg-success rounded-pill">
                    ชำระแล้ว
                  </span>
                ) : value === "Pending" ? (
                  <span className="badge bg-warning rounded-pill">
                    รอดำเนินการ
                  </span>
                ) : value === "Overdue" ? (
                  <span className="badge bg-danger rounded-pill">
                    เกินกำหนด
                  </span>
                ) : value === "Partial" ? (
                  <span className="badge bg-info rounded-pill">แบ่งจ่าย</span>
                ) : (
                  <span className="badge bg-white text-black rounded-pill">
                    ???
                  </span>
                )
              ) : (
                value
              )
            }
            renderActions={(row) => (
              <button
                className="btn btn-sm"
                onClick={() => {
                  const full = invoices.find(
                    (i) => i.invoiceId === row.invoiceId
                  );
                  setSelectedInvoice(full);
                }}
              >
                <i className="bi bi-search"></i>
              </button>
            )}
          />
        </div>

        {/* modal แสดงรายละเอียด */}
        <InvoiceDetailModal
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
          onEdit={() => {
            setEditingInvoice(selectedInvoice); // เปิดฟอร์มแก้ไข
            setSelectedInvoice(null); // ปิด modal รายละเอียด
          }}
        />

        <InvoiceFormModal
          open={editingInvoice != null}
          onClose={() => setEditingInvoice(null)}
          mode="update"
          invoice={editingInvoice}
          onSubmit={async (payload) => {
            const url = `${baseURL}/invoices/${editingInvoice.invoiceId}`;
            try {
              console.log("[AdminInvoicesPage] PUT", url);
              console.log(
                "[AdminInvoicesPage] PUT payload =",
                JSON.stringify(payload, null, 2)
              );
              const res = await axios.put(url, payload);
              console.log(
                "[AdminInvoicesPage] PUT response =",
                res.status,
                res.data
              );
              await fetchInvoices();
              setEditingInvoice(null);
            } catch (err) {
              if (err?.response) {
                console.error(
                  "[AdminInvoicesPage] PUT error =",
                  err.response.status,
                  err.response.data
                );
              } else {
                console.error(
                  "[AdminInvoicesPage] PUT error (network?) =",
                  err
                );
              }
              throw err;
            }
          }}
        />

        <InvoiceFormModal
          open={creatingInvoice}
          onClose={() => setCreatingInvoice(false)}
          mode="create"
          onSubmit={async (data) => {
            try {
              await axios.post(`${baseURL}/invoices`, data);
              await fetchInvoices();
              setCreatingInvoice(false);
            } catch (err) {
              console.error("Create invoice failed:", err);
            }
          }}
        />
      </div>
    </div>
  );
}
