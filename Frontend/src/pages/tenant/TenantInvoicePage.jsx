import React from "react";
import { useParams } from "react-router-dom";
import StatCardBS from "../../components/admin/StatCardBS";
import TableBS from "../../components/admin/TableBS";
import tenantData from "../../data/tenantData.json";
import Footer from "../../components/Footer";
import bgRoom from "../../assets/roomDetailBG.jpg";

export default function TenantInvoicePage() {
  const { roomId } = useParams();
  const data = tenantData[roomId];

  if (!data || !data.invoices) {
    return (
      <div className="container py-5">
        <h4 className="text-danger">ไม่พบข้อมูลใบแจ้งหนี้ของห้อง {roomId}</h4>
      </div>
    );
  }

  const invoices = data.invoices;

  // คำนวณสรุป
  const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
  const unpaidAmount = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalInvoices = invoices.length;
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  // โครงสร้างคอลัมน์
  const columns = [
    { key: "invoice_id", label: "เลขที่บิล" },
    { key: "period", label: "งวด" },
    { key: "amount", label: "จำนวนเงิน" },
    { key: "due_date", label: "กำหนดชำระ" },
    { key: "status", label: "สถานะ" },
  ];

  const filters = [
    {
      key: "status",
      label: "ทุกสถานะ",
      options: [
        { value: "paid", label: "ชำระแล้ว" },
        { value: "pending", label: "รอดำเนินการ" },
        { value: "overdue", label: "เกินกำหนด" },
      ],
    },
  ];

  return (
    <div className="container py-3">
      {/* Section Header + Stats */}
      <div
        className="p-4 rounded mb-4"
        style={{
          backgroundImage: `url(${bgRoom})`, // ใส่ path ของรูปคุณ
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold mb-1">ห้องพักหมายเลข {roomId}</h4>
            <p className="mb-4">ประวัติและรายละเอียดการชำระเงิน</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <StatCardBS
              label="ค้างชำระ"
              value={`฿${unpaidAmount.toLocaleString()}`}
              icon={<i className="bi bi-exclamation-circle text-danger"></i>}
            />
          </div>
          <div className="col-12 col-md-4">
            <StatCardBS
              label="จำนวนบิล"
              value={totalInvoices}
              icon={<i className="bi bi-receipt"></i>}
            />
          </div>
          <div className="col-12 col-md-4">
            <StatCardBS
              label="เกินกำหนด"
              value={overdue}
              icon={<i className="bi bi-clock-history text-warning"></i>}
            />
          </div>
        </div>
      </div>

      {/* ตารางบิล */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light fw-bold">สถานะการชำระเงิน</div>
        <div className="card-body">
          <TableBS
            columns={columns}
            data={invoices}
            filters={filters}
            renderCell={(key, value) =>
              key === "status" ? (
                value === "paid" ? (
                  <span className="badge bg-success">ชำระแล้ว</span>
                ) : value === "pending" ? (
                  <span className="badge bg-warning">รอดำเนินการ</span>
                ) : (
                  <span className="badge bg-danger">เกินกำหนด</span>
                )
              ) : key === "amount" ? (
                `฿${value.toLocaleString()}`
              ) : (
                value
              )
            }
            renderActions={(row) => (
              <button
                className="btn btn-sm"
                onClick={() => alert(`ดูรายละเอียดบิล: ${row.invoice_id}`)}
              >
                <i className="bi bi-search"></i>
              </button>
            )}
          />
        </div>
      </div>

    </div>
  );
}
