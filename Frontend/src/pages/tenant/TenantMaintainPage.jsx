import React from "react";
import { useParams } from "react-router-dom";
import StatCardBS from "../../components/admin/StatCardBS";
import TableBS from "../../components/admin/TableBS";
import tenantData from "../../data/tenantData.json";
import Footer from "../../components/Footer";
import bgRoom from "../../assets/roomDetailBG.jpg";

export default function TenantMaintainPage() {
  const { roomId } = useParams();
  const data = tenantData[roomId];

  if (!data || !data.requests) {
    return (
      <div className="container py-5">
        <h4 className="text-danger">ไม่พบข้อมูลคำขอซ่อมของห้อง {roomId}</h4>
      </div>
    );
  }

  const requests = data.requests;
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (r) => r.status !== "completed"
  ).length;

  const columns = [
    { key: "request_id", label: "รหัสคำขอ" },
    { key: "title", label: "เรื่องที่แจ้งซ่อม" },
    { key: "date", label: "วันที่แจ้ง" },
    { key: "status", label: "สถานะ" },
  ];

    const filters = [
    {
      key: "status",
      label: "ทุกสถานะ",
      options: [
        { value: "completed", label: "เสร็จสิ้น" },
        { value: "in_progress", label: "กำลังดำเนินการ" },
          { value: "pending", label: "รอดำเนินการ" },
      ],
    },
  ];

  return (
    <div className="container py-3">
      <div
        className="p-4 rounded mb-4"
        style={{
          backgroundImage: `url(${bgRoom})`, // ใส่ path ของรูปคุณ
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
 <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">ห้องพักหมายเลข {roomId}</h4>
          <p className="mb-4">
            ประวัติและรายละเอียดการแจ้งซ่อมแซมห้องพัก
          </p>
        </div>
        <button className="btn btn-primary">ส่งคำขอซ่อมใหม่</button>
      </div>

      {/* Stat Card */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <StatCardBS
            label="ทั้งหมด"
            value={`${totalRequests} รายการ`}
            icon={<i className="bi bi-list-task text-primary"></i>}
          />
        </div>
        <div className="col-12 col-md-4">
          <StatCardBS
            label="คำขอรอการซ่อม"
            value={`${pendingRequests} รายการ`}
            icon={<i className="bi bi-tools text-danger"></i>}
          />
        </div>


      </div>

      {/* Header */}
     
       
      </div>
       

      {/* ตารางคำขอซ่อม */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light fw-bold">ประวัติการซ่อมแซม</div>
        <div className="card-body">
          <TableBS
            columns={columns}
            data={requests}
            filters={filters}
            renderCell={(key, value) =>
              key === "status" ? (
                value === "completed" ? (
                  <span className="badge bg-success">เสร็จสิ้น</span>
                ) : value === "in_progress" ? (
                  <span className="badge bg-warning">
                    กำลังดำเนินการ
                  </span>
                ) : (
                  <span className="badge bg-danger">รอดำเนินการ</span>
                )
              ) : (
                value
              )
            }
            renderActions={(row) => (
              <button
                className="btn btn-sm"
                onClick={() => alert(`ดูรายละเอียดคำขอ: ${row.request_id}`)}
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
