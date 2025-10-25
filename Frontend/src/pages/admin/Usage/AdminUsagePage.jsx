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
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchUsages = async () => {
    try {
      const res = await api.get("/meters");
      const data = Array.isArray(res.data) ? res.data : res.data.data;

      // แปลงประเภทให้เป็นชื่อไทย
      const mapped = data.map((u) => ({
        ...u,
        type:
          u.type === "water"
            ? "น้ำ"
            : u.type === "electricity"
            ? "ไฟฟ้า"
            : u.type,
      }));

      setUsages(mapped);
    } catch (err) {
      console.error("Error fetching meter data:", err);
      showToast("โหลดข้อมูลการใช้น้ำ/ไฟฟ้าไม่สำเร็จ", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsages();
  }, []);

  // ฟังก์ชันเมื่อสร้างหรือแก้ไข
  const handleUsageSubmit = (payload) => {
    // console.log("ข้อมูลที่บันทึก:", payload);
    setUsageModalOpen(false);
    setEditData(null);
    fetchUsages(); //  reload table
    showToast("บันทึกข้อมูลสำเร็จ!", "success");
  };

  // ฟังก์ชันอัปโหลด CSV
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/meters/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log(" อัปโหลดสำเร็จ:", res.data);
      showToast("นำเข้าไฟล์ CSV สำเร็จ!", "success");
      fetchUsages(); //  refresh ตารางหลังอัปโหลด
    } catch (err) {
      console.error("❌ Error uploading CSV:", err);
      showToast(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลด CSV",
        "danger"
      );
    } finally {
      e.target.value = ""; // reset input เพื่อให้อัปโหลดไฟล์เดิมซ้ำได้
    }
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
      options: [...new Set(usages.map((u) => u.room))].map((r) => ({
        value: r,
        label: r,
      })),
    },
    {
      key: "type",
      label: "ทุกประเภท",
      options: [...new Set(usages.map((u) => u.type))].map((t) => ({
        value: t,
        label: t,
      })),
    },
    {
      key: "period",
      label: "ทุกรอบ",
      options: [...new Set(usages.map((u) => u.period))].map((p) => ({
        value: p,
        label: p,
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

          <input
            type="file"
            id="csvInput"
            accept=".csv"
            className="d-none"
            onChange={handleFileUpload}
          />
          <button
            className="btn btn-light text-primary me-2"
            onClick={() => document.getElementById("csvInput").click()}
          >
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
        <div className="card-header no-bg d-flex justify-content-between align-items-center p-3">
          <span className="fw-bold">บันทึกการใช้น้ำและไฟฟ้า</span>
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
