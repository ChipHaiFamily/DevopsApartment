import React, { useEffect, useState } from "react";
import axios from "axios";
import StatCardBS from "../../../components/admin/StatCardBS";
import TableBS from "../../../components/admin/TableBS";
import TenantFormModal from "./TenantFormModal";
import TenantDetailModal from "./TenantDetailModal";

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  // console.log("Calling API:", `${baseURL}/tenants`);

  const fetchTenants = () => {
    axios
      .get(`${baseURL}/dashboard/admin/tenant`)
      .then((res) => {
        setTenants(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Error fetching tenants:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, [baseURL]);

  const normalizedTenants = tenants.map((t) => {
    const activeContract = t.contracts?.find(
      (c) => c.status === t.currentStatus
    );

    const nameParts = (t.name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts[1] || "";

    return {
      id: t.tenantId,
      first_name: firstName,
      last_name: lastName,
      gender: t.sex || "-",
      email: t.email || "-",
      tel: t.phone || "-",
      room:
        t.currentStatus === "active" ? activeContract?.roomNumber || "-" : "-",
      status:
        t.currentStatus === "active"
          ? "Active"
          : t.currentStatus === "expired"
          ? "Expired"
          : t.currentStatus === "cancelled"
          ? "Cancelled"
          : "Unknown",
    };
  });

  const totalTenants = tenants.length;
  const totalActive = tenants.filter(
    (i) => i.currentStatus === "active"
  ).length;
  const totalExpired = tenants.filter(
    (i) => i.currentStatus === "expired"
  ).length;
  const totalCancelled = tenants.filter(
    (i) => i.currentStatus === "cancelled"
  ).length;

  const columns = [
    { key: "id", label: "ID" },
    { key: "first_name", label: "ชื่อ" },
    { key: "last_name", label: "นามสกุล" },
    { key: "gender", label: "เพศ" },
    { key: "email", label: "ติดต่อ" },
    { key: "tel", label: "เบอร์โทรศัพท์" },
    { key: "room", label: "ห้อง" },
    { key: "status", label: "สถานะ" },
  ];

  const filters = [
    {
      key: "gender",
      label: "ทุกเพศ",
      options: [
        { value: "Male", label: "ชาย" },
        { value: "Female", label: "หญิง" },
      ],
    },
    {
      key: "status",
      label: "ทุกสถานะ",
      options: [
        { value: "Active", label: "กำลังเช่า" },
        { value: "Expired", label: "หมดสัญญา" },
        { value: "Cancelled", label: "ยกเลิก" },
      ],
    },
  ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">จัดการผู้เช่า</h3>
          <p className="text-muted mb-0">จัดการข้อมูลผู้เช่าและผู้สนใจ</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + สร้างผู้เช่าใหม่
        </button>
      </div>

      {/* เมทริก */}
      <div className="row g-3 mb-2">
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="ผู้เข่าทั้งหมด"
            value={totalTenants}
            icon={<i className="bi bi-person-fill text-fill"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="สัญญาที่ใช้งาน"
            value={totalActive}
            icon={<i className="bi bi-person-fill text-success"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <StatCardBS
            label="เลิกเช่า"
            value={totalExpired}
            icon={<i className="bi bi-person-fill text-danger"></i>}
          />
        </div>
      </div>

      {/* ตารางบิล */}
      <div className="card shadow-sm">
        <div className="card-header bg-light d-flex justify-content-between align-items-center p-3">
          <span>รายชื่อผู้เช่า</span>
        </div>

        <div className="card-body">
          <TableBS
            columns={columns}
            data={normalizedTenants}
            filters={filters}
            renderCell={(key, value, row) => {
              if (key === "status") {
                if (value === "Active")
                  return (
                    <span className="badge bg-success rounded-pill">
                      กำลังเช่า
                    </span>
                  );
                if (value === "Expired")
                  return (
                    <span className="badge bg-danger rounded-pill">
                      หมดสัญญา
                    </span>
                  );
                if (value === "Cancelled")
                  return (
                    <span className="badge bg-warning rounded-pill">
                      ยกเลิก
                    </span>
                  );
                return (
                  <span className="badge bg-secondary rounded-pill">
                    ไม่มีสัญญา
                  </span>
                );
              }

              if (key === "gender") {
                return value === "Male"
                  ? "ชาย"
                  : value === "Female"
                  ? "หญิง"
                  : value;
              }
              return value;
            }}
            renderActions={(row) => (
              <button
                className="btn btn-sm"
                onClick={() => {
                  const tenant = tenants.find((t) => t.tenantId === row.id);
                  setSelectedTenant(tenant);
                }}
              >
                <i className="bi bi-search"></i>
              </button>
            )}
          />
        </div>
      </div>

      <TenantFormModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(newTenant) => {
          axios
            .post(`${baseURL}/tenants`, newTenant)
            .then(() => {
              setShowModal(false);
              setTimeout(fetchTenants, 500);
            })
            .catch((err) => console.error("Error creating tenant:", err));
        }}
      />

      <TenantDetailModal
        open={!!selectedTenant}
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
      />
    </div>
  );
}
