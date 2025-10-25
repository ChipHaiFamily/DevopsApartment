import React, { useMemo, useState, useEffect } from "react";
import api from "../../../api/axiosConfig";
import StatCardBS from "../../../components/admin/StatCardBS";
import CreateRoomModal from "./CreateRoomModal";
import RoomTypeManage from "./RoomTypeManage";

/** Utils หา tenant ปัจจุบันของห้องจากสัญญา */

const STATUS_LABEL = {
  available: "ว่าง",
  occupied: "ไม่ว่าง",
  maintenance: "ปรับปรุง",
  reserved: "จองแล้ว",
};

export default function RoomsManage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openRoomTypeModal, setOpenRoomTypeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const handleCreateRoom = async (data) => {
    fetchRooms(); // รีโหลดข้อมูลใหม่หลัง modal สร้างเสร็จ
    setOpenCreateModal(false);
  };

  /** ดึงข้อมูลห้องพัก */
  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      if (res.data.success) {
        setRooms(res.data.data);

        // ตั้ง default เป็นห้อง 101
        const firstRoom = res.data.data.find((r) => r.roomNum === "101");
        if (firstRoom) {
          setSelected(firstRoom);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ฟังก์ชันช่วยเรียก toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // เปิด Modal ยืนยันการลบ
  const confirmDeleteRoom = (room) => {
    setDeleteTarget(room);
    setShowDeleteModal(true);
  };

  // ลบห้องจริง
  const handleDeleteRoom = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/rooms/${deleteTarget.roomNum}`);
      setShowDeleteModal(false);
      setSelected(null);
      fetchRooms();
      showToast(`ลบห้อง ${deleteTarget.roomNum} เรียบร้อยแล้ว`, "success");
    } catch (err) {
      console.error("Error deleting room:", err);
      showToast(err?.response?.data?.message || "ไม่สามารถลบห้องได้", "danger");
    }
  };

  // ---------- derived stats ----------
  const total = rooms.length;
  const available = rooms.filter((r) => r.status === "available").length;
  const occupied = rooms.filter((r) => r.status === "occupied").length;
  const maintenance = rooms.filter((r) => r.status === "maintenance").length;

  // ---------- filters ----------
  const [q, setQ] = useState("");
  const [floorFilter, setFloorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const floors = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b),
    [rooms]
  );

  const filteredRooms = rooms.filter((r) => {
    if (q && !`${r.room_num}`.includes(q)) return false;
    if (floorFilter !== "all" && r.floor !== Number(floorFilter)) return false;
    if (typeFilter !== "all" && r.roomTypeName !== typeFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  // group by floor (เฉพาะห้องหลัง filter)
  const grouped = floors.map((f) => ({
    floor: f,
    items: filteredRooms.filter((r) => r.floor === f),
  }));

  const currentTenant = selected ? selected.tenantName : null;
  const selStatus = selected ? STATUS_LABEL[selected.status] : "";

  const toggleRoomStatus = async () => {
    if (!selected) return;
    const newStatus =
      selected.status === "available" ? "maintenance" : "available";

    try {
      await api.put(`/rooms/${selected.roomNum}`, {
        ...selected,
        status: newStatus,
      });
      // อัปเดต state ใน frontend
      setRooms((prev) =>
        prev.map((r) =>
          r.roomNum === selected.roomNum ? { ...r, status: newStatus } : r
        )
      );
      setSelected((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating room status:", err);
      alert("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  return (
    <div
      className="container py-3"
      style={{ fontFamily: "Kanit, system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">จัดการห้อง</h3>
          <p className="text-muted mb-0">รายงานและสถิติการดำเนินงาน</p>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-light text-primary me-2"
            onClick={() => setOpenRoomTypeModal(true)}
          >
            จัดการประเภทห้องพัก
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpenCreateModal(true)}
          >
            + เพิ่มห้องพัก
          </button>
        </div>
      </div>

      {/* ===== Stat tiles ===== */}
      {/* เมทริก 4 ช่อง */}
      <div className="row g-3 mb-2">
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ห้องพักทั้งหมด"
            value={total}
            icon={<i className="bi bi-building "></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ห้องว่าง"
            value={available}
            icon={<i className="bi bi-building text-success"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ห้องที่ให้เช่า"
            value={occupied}
            icon={<i className="bi bi-building text-danger"></i>}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <StatCardBS
            label="ห้องปิดปรับปรุง"
            value={maintenance}
            icon={<i className="bi bi-building text-warning"></i>}
          />
        </div>
      </div>

      {/* ===== Toolbar ===== */}
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0">แผนที่ห้อง</h6>

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

          <select
            className="form-select"
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            style={{ width: 120 }}
          >
            <option value="all">ทุกชั้น</option>
            {floors.map((f) => (
              <option key={f} value={f}>
                ชั้น {f}
              </option>
            ))}
          </select>

          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="all">ทุกประเภท</option>
            {Array.from(new Set(rooms.map((r) => r.roomTypeName))).map(
              (name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              )
            )}
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="all">ทุกสถานะ</option>
            <option value="available">ว่าง</option>
            <option value="occupied">ไม่ว่าง</option>
            <option value="maintenance">ปรับปรุง</option>
            <option value="reserved">จองแล้ว</option>
          </select>
        </div>
      </div>

      {/* ===== Grid + Detail ===== */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card card-soft">
            <div className="card-body">
              {grouped.map((group) => (
                <div key={group.floor} className="mb-2">
                  <div className="text-secondary small fw-semibold mb-2">
                    ชั้น {group.floor}
                  </div>
                  <div className="d-grid room-grid">
                    {group.items
                      .sort((a, b) =>
                        a.roomNum.localeCompare(b.roomNum, "en", {
                          numeric: true,
                        })
                      )
                      .map((r) => (
                        <button
                          key={r.roomNum}
                          className={`room-cell text-start ${r.status}`}
                          onClick={() => setSelected(r)}
                        >
                          <div className="d-flex justify-content-between mb-2">
                            <div className="fw-bold">{r.roomNum}</div>
                            {selected?.roomNum === r.roomNum && (
                              <span className="active-dot" />
                            )}
                          </div>
                          <div className="text-secondary small mb-2">
                            {r.roomTypeName.replace(" Studio", "")}
                          </div>
                          <span
                            className={`badge mb-2 rounded-pill status-badge ${r.status}`}
                          >
                            {STATUS_LABEL[r.status]}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Detail panel ===== */}
        <div className="col-lg-4">
          <div className="card card-soft position-sticky" style={{ top: 16 }}>
            <div className="card-body">
              {selected && (
                <>
                  <h6 className="fw-bold mb-1">ห้อง {selected.roomNum}</h6>
                  <div className="text-secondary small mb-3">
                    รายละเอียดห้องพักและข้อมูลปัจจุบัน
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="text-secondary small">ประเภทห้อง</div>
                      <div className="fw-semibold">{selected.roomTypeName}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-secondary small">สถานะ</div>
                      <div
                        className={`fw-semibold text-${
                          selected.status === "available"
                            ? "success"
                            : selected.status === "occupied"
                            ? "danger"
                            : selected.status === "reserved"
                            ? "primary"
                            : "warning"
                        }`}
                      >
                        {selStatus}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-secondary small">
                        ค่าเช่าต่อเดือน
                      </div>
                      <div className="fw-semibold text-primary">
                        ฿ {selected.price?.toLocaleString()}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-secondary small">
                        ผู้เช่าปัจจุบัน
                      </div>
                      <div className="fw-semibold">{currentTenant || "-"}</div>
                    </div>
                  </div>

                  <div className="vstack gap-2">
                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={toggleRoomStatus}
                      disabled={
                        !["available", "maintenance"].includes(selected?.status)
                      }
                    >
                      {selected?.status === "available"
                        ? "ปิดปรับปรุง"
                        : selected?.status === "maintenance"
                        ? "เปิดให้เช่า"
                        : "ไม่สามารถเปลี่ยนสถานะได้"}
                    </button>

                    <button
                      className="btn btn-outline-danger w-100"
                      onClick={() => confirmDeleteRoom(selected)}
                    >
                      ลบห้อง
                    </button>

                    {/* <button className="btn btn-outline-primary w-100">
                      ดูรายละเอียดเงินมัดจำ
                    </button> */}
                    {/* <button className="btn btn-outline-primary w-100">
                      แก้ไขข้อมูล
                    </button> */}
                    {/* <button className="btn btn-outline-primary w-100">
                      บันทึกมิเตอร์
                    </button> */}
                    {/* <button className="btn btn-outline-secondary w-100">
                      ข้อมูลผู้เช่า
                    </button> */}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== RoomType Manage Modal ===== */}
      {openRoomTypeModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">จัดการประเภทห้องพัก</h5>
                  <button
                    className="btn-close"
                    onClick={() => setOpenRoomTypeModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <RoomTypeManage onClose={() => setOpenRoomTypeModal(false)} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* ===== Modal เพิ่มห้องพัก ===== */}
      <CreateRoomModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSubmit={handleCreateRoom}
      />

      {/* ===== Modal ยืนยันการลบห้อง ===== */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-danger">
                    ยืนยันการลบห้อง
                  </h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    ต้องการลบห้อง <strong>{deleteTarget?.roomNum}</strong>{" "}
                    ใช่หรือไม่?
                  </p>
                  <p className="text-muted mb-0">
                    ห้องนี้จะถูกลบออกจากระบบและไม่สามารถกู้คืนได้
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    ยกเลิก
                  </button>
                  <button className="btn btn-danger" onClick={handleDeleteRoom}>
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
