import React, { useEffect, useState } from "react";
import axios from "axios";

export default function LeaseFormModal({
  open,
  onClose,
  onSubmit,
  contract,
  mode = "create", // create | update | read
}) {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  const isReadOnly = mode === "read";
  const isUpdateLimited = mode === "update";

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/tenants`)
      .then((res) =>
        setTenants(Array.isArray(res.data) ? res.data : res.data.data)
      )
      .catch((err) => console.error("Error fetching tenants:", err));

    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/rooms`)
      .then((res) => setRooms(res.data?.data ?? []))
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  // คำนวณวันที่ 1 ของเดือนถัดไป
  const getNextMonthStart = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1, 1); // เดือนถัดไป, วันที่ 1
    return d.toISOString().split("T")[0]; // yyyy-mm-dd
  };

  const getDefaultDeposit = (price) => price * 2; // เงินมัดจำ = 2x ค่าเช่า

  // ฟอร์มเริ่มต้น
  const [form, setForm] = useState({
    startDate: mode === "create" ? getNextMonthStart() : "",
    endDate: "",
    rentAmount: 0,
    deposit: 0,
    billingCycle: "monthly",
    contractLink: "",
    tenantId: "",
    roomNum: "",
    contractNum: "",
    status: "active",
  });

  // preload ข้อมูลตอน update/read
  useEffect(() => {
    if ((mode === "update" || mode === "read") && contract) {
      setForm({
        contractNum: contract.contractNum || "",
        startDate: contract.startDate || "",
        endDate: contract.endDate || "",
        rentAmount: contract.rentAmount || 0,
        deposit: contract.deposit || 0,
        billingCycle: contract.billingCycle || "monthly",
        status: contract.status || "active",
        contractLink: contract.contractLink || "",
        tenantId: contract.tenant?.tenantId || "",
        roomNum: contract.room?.roomNum || "",
      });
    }
  }, [mode, contract]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "roomNum") {
      const selectedRoom = rooms.find((r) => r.roomNum === value);
      if (selectedRoom) {
        setForm((prev) => ({
          ...prev,
          roomNum: value,
          rentAmount: selectedRoom.price || prev.rentAmount,
          deposit: getDefaultDeposit(selectedRoom.price || prev.rentAmount),
        }));
        return;
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // สร้าง payload
    const payload = {
      startDate: form.startDate,
      endDate: form.endDate,
      rentAmount: form.rentAmount,
      deposit: form.deposit,
      billingCycle: form.billingCycle,
      contractLink: form.contractLink,
      tenant: { tenantId: form.tenantId },
      room: { roomNum: form.roomNum },
      ...(mode === "update" && {
        contractNum: form.contractNum,
        status: form.status,
      }),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err?.response?.data?.message || "ไม่สามารถบันทึกได้");
    }
  };

  const handleTenantChange = async (tenantId) => {
    setForm((prev) => ({ ...prev, tenantId }));

    try {
      // เรียก reservation ของ tenant
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/reservations`
      );
      const reservations = res.data || [];

      const matched = reservations.find(
        (r) =>
          r.user.id === tenantId && r.assignedRoom && r.status === "processing"
      );

      if (matched) {
        setForm((prev) => ({ ...prev, roomNum: matched.assignedRoom }));
      }
    } catch (err) {
      console.error("Error fetching reservations for tenant:", err);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content"
            style={{ fontFamily: "Kanit, system-ui, sans-serif" }}
          >
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                {mode === "create"
                  ? "สร้างสัญญาใหม่"
                  : mode === "update"
                  ? "แก้ไขสัญญา"
                  : "รายละเอียดสัญญา"}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="row g-3 mb-3">
                {/* contractNum + status */}
                {(mode === "update" || mode === "read") && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">เลขที่สัญญา</label>
                      <input
                        className="form-control"
                        name="contractNum"
                        value={form.contractNum}
                        readOnly
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">สถานะ</label>
                      <select
                        className="form-select"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        disabled={isReadOnly} // update แก้ได้
                      >
                        <option value="active">ใช้งาน</option>
                        <option value="expired">หมดอายุ</option>
                        <option value="cancelled">ยกเลิก</option>
                      </select>
                    </div>
                  </>
                )}

                {/* startDate */}
                <div className="col-md-6">
                  <label className="form-label">วันเริ่มต้น</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  />
                </div>

                {/* endDate */}
                <div className="col-md-6">
                  <label className="form-label">วันสิ้นสุด</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  />
                </div>

                {/* rentAmount */}
                <div className="col-md-6">
                  <label className="form-label">ค่าเช่า</label>
                  <input
                    type="number"
                    className="form-control"
                    name="rentAmount"
                    value={form.rentAmount}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  />
                </div>

                {/* deposit */}
                <div className="col-md-6">
                  <label className="form-label">เงินมัดจำ</label>
                  <input
                    type="number"
                    className="form-control"
                    name="deposit"
                    value={form.deposit}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  />
                </div>

                {/* billingCycle */}
                <div className="col-md-6">
                  <label className="form-label">รอบบิล</label>
                  <select
                    className="form-select"
                    name="billingCycle"
                    value={form.billingCycle}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  >
                    <option value="monthly">รายเดือน</option>
                    <option value="yearly">รายปี</option>
                  </select>
                </div>

                {/* contractLink */}
                <div className="col-md-6">
                  <label className="form-label">เอกสารสัญญา (ลิงก์)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="contractLink"
                    value={form.contractLink}
                    onChange={handleChange}
                    disabled={isReadOnly} // update แก้ได้
                  />
                </div>

                {/* tenant */}
                <div className="col-md-12">
                  <label className="form-label">ผู้เช่า</label>
                  <select
                    className="form-select"
                    name="tenantId"
                    value={form.tenantId}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    disabled={isReadOnly || isUpdateLimited}
                  >
                    <option value="">-- เลือกผู้เช่า --</option>
                    {tenants.map((t) => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.user.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* room */}
                <div className="col-md-12">
                  <label className="form-label">ห้อง</label>
                  <select
                    className="form-select"
                    name="roomNum"
                    value={form.roomNum}
                    onChange={handleChange}
                    disabled={isReadOnly || isUpdateLimited}
                  >
                    <option value="">-- เลือกห้อง --</option>
                    {rooms.length > 0 ? (
                      rooms
                        .filter(
                          (r) =>
                            r.status === "available" ||
                            r.roomNum === form.roomNum
                        )
                        .map((r) => (
                          <option key={r.roomNum} value={r.roomNum}>
                            ห้อง {r.roomNum} {r.roomTypeName}
                          </option>
                        ))
                    ) : (
                      <option disabled>ไม่มีห้องว่าง</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose}>
                {mode === "read" ? "ปิด" : "ยกเลิก"}
              </button>
              {mode !== "read" && (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  บันทึก
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
