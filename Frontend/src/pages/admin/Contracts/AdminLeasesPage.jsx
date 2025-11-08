import React, { useEffect, useState } from "react";
import StatCardBS from "../../../components/admin/StatCardBS";
import TableBS from "../../../components/admin/TableBS";
import LeaseFormModal from "./LeaseFormModal";
import api from "../../../api/axiosConfig";

export default function AdminLeasesPage() {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);

  const fetchLeases = async () => {
    try {
      const res = await api.get("/contracts");
      const data = res.data;
      if (Array.isArray(data)) {
        const sorted = data.sort(
          (a, b) => new Date(b.endDate) - new Date(a.endDate)
        );
        setLeases(sorted);
      } else {
        console.error("Contracts API did not return an array:", data);
        setLeases([]);
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
      setLeases([]); // กันไว้
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  const normalizedLeases = Array.isArray(leases)
    ? leases.map((c) => ({
        contract_id: c.contractNum,
        room_number: c.room?.roomNum || "-",
        tenant_name: c.tenant?.user?.fullName || "-",
        email: c.tenant?.user?.tel || "-",
        billing_cycle: c.billingCycle || "-",
        rent_amount: c.rentAmount || 0,
        deposit: c.deposit || 0,
        start_date: c.startDate || "-",
        end_date: c.endDate || "-",
        period: `${c.startDate || "-"} - ${c.endDate || "-"}`,
        status: c.status || "-",
        floor: c.room?.floor ? `${c.room.floor}` : "-",
        raw: c,
      }))
    : [];

  const totalLeases = leases.length;
  const totalAcitve = leases.filter((i) => i.status === "active").length;
  const totalExpired = leases.filter((i) => i.status === "expired").length;

  const columns = [
    { key: "contract_id", label: "สัญญาเลขที่" },
    { key: "floor", label: "ชั้น" },
    { key: "room_number", label: "ห้อง" },
    { key: "tenant_name", label: "ผู้เช่า" },
    { key: "billing_cycle", label: "วงจรบิล" },
    { key: "rent_amount", label: "ค่าเช่า" },
    { key: "period", label: "ระยะเวลา" },
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
      key: "billing_cycle",
      label: "ทุกวงจรบิล",
      options: [
        { value: "monthly", label: "รายเดือน" },
        { value: "yearly", label: "รายปี" },
      ],
    },
    {
      key: "status",
      label: "ทุกสถานะ",
      options: [
        { value: "active", label: "ใช้งาน" },
        { value: "expired", label: "หมดอายุ" },
      ],
    },
  ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">สัญญาเช่า</h3>
          <p className="text-muted mb-0">
            จัดการสัญญาเช่าและเอกสารที่เกี่ยวข้อง
          </p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-primary me-2 "
            onClick={() => setShowContractModal(true)}
          >
            + สร้างสัญญาใหม่
          </button>
        </div>
      </div>
      {/* เมทริก */}
      <div className="row g-3 mb-2">
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="สัญญาทั้งหมด"
            value={totalLeases}
            icon={<i className="bi bi-file-earmark-text-fill"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="สัญญาที่ใช้งาน"
            value={totalAcitve}
            icon={<i className="bi bi-file-earmark-text-fill text-success"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="หมดอายุ"
            value={totalExpired}
            icon={<i className="bi bi-file-earmark-text-fill text-danger"></i>}
          />
        </div>
      </div>

      {/* ตารางบิล */}
      <div className="card shadow-sm">
        <div className="card-header no-bg bg-light d-flex justify-content-between align-items-center p-3">
          <span className="fw-bold">สัญญาเช่า</span>
        </div>

        <div className="card-body">
          <TableBS
            columns={columns}
            data={normalizedLeases}
            filters={filters}
            renderCell={(key, value, row) => {
              if (key === "billing_cycle") {
                return value === "monthly"
                  ? "รายเดือน"
                  : value === "yearly"
                  ? "รายปี"
                  : value;
              }
              if (key === "rent_amount") {
                return (
                  <div>
                    ฿{value ? value.toLocaleString() : "-"}
                    <div className="text-muted small">{row.note || ""}</div>
                  </div>
                );
              }
              if (key === "period") {
                return (
                  <div>
                    {row.start_date}
                    <div className="text-muted small">ถึง {row.end_date}</div>
                  </div>
                );
              }
              if (key === "status") {
                return value === "active" ? (
                  <span className="badge bg-success">ใช้งาน</span>
                ) : value === "expired" ? (
                  <span className="badge bg-danger">หมดอายุ</span>
                ) : value === "cancelled" ? (
                  <span className="badge bg-warning">ยกเลิก</span>
                ) : (
                  <span className="badge bg-primary">???</span>
                );
              }
              return value;
            }}
            renderActions={(row) => (
              <button
                className="btn btn-sm"
                onClick={() => setSelectedLease(row)}
              >
                <i className="bi bi-search"></i>
              </button>
            )}
          />

          <LeaseFormModal
            open={!!selectedLease}
            onClose={() => setSelectedLease(null)}
            mode="update"
            contract={selectedLease?.raw}
            onSubmit={async (payload) => {
              await api.put(
                `/contracts/${selectedLease.raw.contractNum}`,
                payload
              );
              fetchLeases();
              setSelectedLease(null);
            }}
          />

          <LeaseFormModal
            open={showContractModal}
            onClose={() => setShowContractModal(false)}
            mode="create"
            onSubmit={async (payload) => {
              // console.log("Payload CREATE =", payload); // debug log
              await api.post(`/contracts`, payload);
              fetchLeases();
              setShowContractModal(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
