import React from "react";

export default function FilterBar({
  title = "แผนที่ห้อง",
  q, setQ,
  floorFilter, setFloorFilter,
  typeFilter, setTypeFilter,
  statusFilter, setStatusFilter,
  floors, roomTypes,
  viewMode, setViewMode, // เพื่อสลับ Map/Table
}) {
  return (
    <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
      <h6 className="fw-bold mb-0">{title}</h6>

      <div className="d-flex flex-wrap gap-2 ms-auto">
        <div className="input-group me-2" style={{ width: 320 }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-secondary" />
          </span>
          <input
            className="form-control border-start-0"
            placeholder="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select className="form-select" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)} style={{ width: 120 }}>
          <option value="all">ทุกชั้น</option>
          {floors.map((f) => <option key={f} value={f}>ชั้น {f}</option>)}
        </select>

        <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: 140 }}>
          <option value="all">ทุกประเภท</option>
          {roomTypes.map((rt) => <option key={rt.room_type_id} value={rt.room_type_id}>{rt.name}</option>)}
        </select>

        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 140 }}>
          <option value="all">ทุกสถานะ</option>
          <option value="available">ว่าง</option>
          <option value="occupied">ไม่ว่าง</option>
          <option value="maintenance">ปรับปรุง</option>
        </select>

        {/* Toggle Map/Table */}
        <div className="btn-group ms-2">
          <button className={`btn ${viewMode === "map" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("map")}>
            แผนที่
          </button>
          <button className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("table")}>
            ตาราง
          </button>
        </div>
      </div>
    </div>
  );
}