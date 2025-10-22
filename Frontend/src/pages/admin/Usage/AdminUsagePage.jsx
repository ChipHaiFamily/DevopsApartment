import React, { useEffect, useState } from "react";
import StatCardBS from "../../../components/admin/StatCardBS";
import TableBS from "../../../components/admin/TableBS";
import UsageFormModal from "./UsageFormModal";
import UsageSettingModal from "./UsageSettingModal";
import api from "../../../api/axiosConfig";

export default function AdminUsagePage() {
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [usageSettingOpen, setUsageSettingOpen] = useState(false);

  // mock data ตามภาพ
  useEffect(() => {
    const mockData = [
      {
        meterId: "MTR-2025-08-107-01",
        room: "107",
        period: "2025-08",
        type: "น้ำ",
        unit: 10,
        recordDate: "2025-08-25",
      },
      {
        meterId: "MTR-2025-08-107-02",
        room: "107",
        period: "2025-08",
        type: "ไฟฟ้า",
        unit: 150,
        recordDate: "2025-08-25",
      },
      {
        meterId: "MTR-2025-08-108-01",
        room: "108",
        period: "2025-08",
        type: "น้ำ",
        unit: 30,
        recordDate: "2025-08-25",
      },
      {
        meterId: "MTR-2025-08-108-02",
        room: "108",
        period: "2025-08",
        type: "ไฟฟ้า",
        unit: 20,
        recordDate: "2025-08-25",
      },
    ];
    setTimeout(() => {
      setUsages(mockData);
      setLoading(false);
    }, 400);
  }, []);

  // ฟังก์ชันเมื่อสร้างหรือแก้ไข
  const handleUsageSubmit = (payload) => {
    console.log("📦 ข้อมูลที่บันทึก:", payload);
    alert("บันทึกสำเร็จ!");
    setUsageModalOpen(false);
    setEditData(null);
  };

  // metrics (mock)
  const totalWater = usages
    .filter((u) => u.type === "น้ำ")
    .reduce((sum, u) => sum + u.unit, 0);
  const totalElectric = usages
    .filter((u) => u.type === "ไฟฟ้า")
    .reduce((sum, u) => sum + u.unit, 0);
  const waterRate = 25.0;
  const electricRate = 6.5;

  const columns = [
    { key: "meterId", label: "เลขรายการบันทึก" },
    { key: "room", label: "ห้อง" },
    { key: "period", label: "รอบ" },
    { key: "type", label: "ประเภท" },
    { key: "unit", label: "หน่วย" },
    { key: "recordDate", label: "วันที่บันทึก" },
  ];

  const filters = [
    {
      key: "room",
      label: "ทุกห้อง",
      options: [
        { value: "107", label: "107" },
        { value: "108", label: "108" },
      ],
    },
    {
      key: "type",
      label: "ทุกประเภท",
      options: [
        { value: "น้ำ", label: "น้ำ" },
        { value: "ไฟฟ้า", label: "ไฟฟ้า" },
      ],
    },
    {
      key: "period",
      label: "ทุกรอบ",
      options: [{ value: "2025-08", label: "2025-08" }],
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
          <h3 className="mb-0">การใช้น้ำและไฟฟ้า</h3>
          <p className="text-muted mb-0">
            แสดงข้อมูลการใช้น้ำและไฟฟ้าของผู้เช่าแต่ละห้อง
          </p>
        </div>
        <div>
          <button
            className="btn btn-success me-2"
            onClick={() => setUsageSettingOpen(true)}
          >
            ตั้งค่าราคาต่อหน่วย
          </button>
          <button className="btn btn-light text-primary me-2">
            นำเข้า CSV
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setUsageModalOpen(true)}
          >
            + สร้างบันทึกใหม่
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="การใช้น้ำรวมเดือนนี้"
            value={`${totalWater.toFixed(1)} หน่วย`}
            icon={<i className="bi bi-droplet text-primary"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="การใช้ไฟฟ้ารวมเดือนนี้"
            value={`${totalElectric.toFixed(1)} หน่วย`}
            icon={<i className="bi bi-lightning-charge text-warning"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ค่าน้ำต่อหน่วย"
            value={`฿${waterRate.toFixed(2)}/หน่วย`}
            icon={<i className="bi bi-droplet-half text-info"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ค่าไฟฟ้าต่อหน่วย"
            value={`฿${electricRate.toFixed(2)}/หน่วย`}
            icon={<i className="bi bi-lightning text-danger"></i>}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center p-3">
          <span>รายการ</span>
        </div>
        <div className="card-body">
          <TableBS
            columns={columns}
            data={usages}
            filters={filters}
            renderActions={(row) => (
              <button
                className="btn btn-sm"
                onClick={() => {
                  setEditData(row);
                  setUsageModalOpen(true);
                }}
              >
                <i className="bi bi-search"></i>
              </button>
            )}
          />
        </div>
      </div>

      <UsageFormModal
        open={usageModalOpen}
        onClose={() => {
          setUsageModalOpen(false);
          setEditData(null);
        }}
        onSubmit={handleUsageSubmit}
        initialData={editData}
      />

      <UsageSettingModal
        open={usageSettingOpen}
        onClose={() => setUsageSettingOpen(false)}
      />
    </div>
  );
}
