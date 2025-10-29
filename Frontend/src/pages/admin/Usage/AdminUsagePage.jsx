import React, { useEffect, useState, useRef } from "react";
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
  const [waterRate, setWaterRate] = useState(0);
  const [electricRate, setElectricRate] = useState(0);

  const toastRef = useRef(null);

  const showToast = (message, type = "success") => {
    const toastEl = toastRef.current;
    if (!toastEl) return;

    const toastBody = toastEl.querySelector(".toast-body");
    toastBody.textContent = message;

    toastEl.classList.remove("bg-success", "bg-danger");
    toastEl.classList.add(type === "success" ? "bg-success" : "bg-danger");

    const bsToast = new window.bootstrap.Toast(toastEl);
    bsToast.show();
  };

  const fetchUsages = async () => {
    try {
      const res = await api.get("/meters");
      const data = Array.isArray(res.data) ? res.data : res.data.data;

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

  const fetchMeterRates = async () => {
    try {
      const res = await api.get("/meter-rate/latest");
      const rates = Array.isArray(res.data) ? res.data : res.data.data;

      const water = rates.find((r) => r.type === "water");
      const electric = rates.find((r) => r.type === "electricity");

      if (water) setWaterRate(water.rate);
      if (electric) setElectricRate(electric.rate);
    } catch (err) {
      console.error("Error fetching meter rates:", err);
      showToast("โหลดราคาต่อหน่วยไม่สำเร็จ", "danger");
    }
  };

  useEffect(() => {
    fetchUsages();
    fetchMeterRates();
  }, []);

  // ฟังก์ชันเมื่อสร้างหรือแก้ไข
  const handleUsageSubmit = (payload) => {
    setUsageModalOpen(false);
    setEditData(null);
    fetchUsages();
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

      console.log("✅ อัปโหลดสำเร็จ:", res.data);
      showToast("นำเข้าไฟล์ CSV สำเร็จ!", "success");
      fetchUsages();
    } catch (err) {
      console.error("❌ Error uploading CSV:", err);
      showToast(
        err?.response?.data?.message || "เกิดข้อผิดพลาดในการอัปโหลด CSV",
        "danger"
      );
    } finally {
      e.target.value = "";
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalWater = usages
    .filter(
      (u) =>
        u.type === "น้ำ" &&
        new Date(u.recordDate).getMonth() === currentMonth &&
        new Date(u.recordDate).getFullYear() === currentYear
    )
    .reduce((sum, u) => sum + u.unit, 0);

  const totalElectric = usages
    .filter(
      (u) =>
        u.type === "ไฟฟ้า" &&
        new Date(u.recordDate).getMonth() === currentMonth &&
        new Date(u.recordDate).getFullYear() === currentYear
    )
    .reduce((sum, u) => sum + u.unit, 0);

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
        mode={editData ? "edit" : "create"}
      />

      <UsageSettingModal
        open={usageSettingOpen}
        onClose={() => setUsageSettingOpen(false)}
        onSaved={() => {
          fetchMeterRates();
          showToast("อัปเดตราคาต่อหน่วยเรียบร้อย!", "success");
        }}
        onToast={(msg, type) => showToast(msg, type)}
      />

      {/* Bootstrap Toast Container */}
      <div
        className="toast position-fixed top-0 end-0 m-3 text-white"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        ref={toastRef}
        style={{ zIndex: 2000 }}
      >
        <div className="toast-body">บันทึกข้อมูลสำเร็จ</div>
      </div>
    </div>
  );
}
