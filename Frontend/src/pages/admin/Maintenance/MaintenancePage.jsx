import React, { useState, useEffect } from "react";
import axios from "axios";
import StatCardBS from "../../../components/admin/StatCardBS";
import TableBS from "../../../components/admin/TableBS";
import MaintenanceFormModal from "./MaintenanceFormModal";
import MaintenanceScheduleFormModal from "./MaintenanceScheduleFormModal";

export default function MaintenancePage() {
  const [logs, setLogs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [tab, setTab] = useState("tickets");

  const [selectedLog, setSelectedLog] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formOpenSchedule, setFormOpenSchedule] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => { reloadLogs(); }, [baseURL]);
  useEffect(() => { reloadSchedules(); }, [baseURL]);

  const reloadLogs = async () => {
    try {
      const res = await axios.get(`${baseURL}/maintenance-logs`);
      setLogs(Array.isArray(res.data) ? res.data : []);
      setLoadingLogs(false);
    } catch (err) {
      console.error("Error fetching maintenance logs:", err);
      setLoadingLogs(false);
    }
  };

  const reloadSchedules = async () => {
    try {
      const res = await axios.get(`${baseURL}/maintenance-schedules`);
      setSchedules(Array.isArray(res.data) ? res.data : []);
      setLoadingSchedules(false);
    } catch (err) {
      console.error("Error fetching maintenance schedules:", err);
      setLoadingSchedules(false);
    }
  };

  // ===== Helpers =====
  const todayStr = () => new Date().toISOString().split("T")[0];

  const parseIntervalDays = (val) => {
    if (!val && val !== 0) return 0;
    // รองรับ "90_days", "90 days", "90d", "P90D"
    const m = String(val).match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  };

  const addDaysSafe = (baseDateStr, days) => {
    let base = new Date(baseDateStr);
    if (isNaN(base.getTime())) base = new Date(); // ถ้า nextDue เดิมว่าง ให้เริ่มจากวันนี้
    base.setDate(base.getDate() + (Number.isFinite(days) ? days : 0));
    return base.toISOString().split("T")[0];
  };

  // ===== Actions for schedules =====
  const handleDoNow = async (row) => {
    try {
      const days = parseIntervalDays(row.cycleInterval);
      const today = todayStr();
      const next = addDaysSafe(today, days);

      const payload = {
        scheduleId: row.scheduleId,
        taskName: row.taskName,
        cycleInterval: row.cycleInterval,
        lastCompleted: today,
        nextDue: next,
      };

      await axios.put(`${baseURL}/maintenance-schedules/${row.scheduleId}`, payload);
      await reloadSchedules();
    } catch (err) {
      console.error("Error updating schedule (Do Now):", err);
    }
  };

  const handleSkip = async (row) => {
    try {
      const days = parseIntervalDays(row.cycleInterval);
      const base = row.nextDue || todayStr();
      const next = addDaysSafe(base, days);

      const payload = {
        scheduleId: row.scheduleId,
        taskName: row.taskName,
        cycleInterval: row.cycleInterval,
        lastCompleted: row.lastCompleted || null,
        nextDue: next,
      };

      await axios.put(`${baseURL}/maintenance-schedules/${row.scheduleId}`, payload);
      await reloadSchedules();
    } catch (err) {
      console.error("Error updating schedule (Skip):", err);
    }
  };

  // ===== Normalize logs =====
  const normalizedLogs = logs.map((l) => ({
    log_id: l.logId,
    room: l.room?.roomNum || "-",
    type: l.logType,
    description: l.description,
    technician: l.technician,
    cost: l.cost,
    status: l.status,
    request_date: l.requestDate,
    completed_date: l.completedDate || "-",
  }));

  const logColumns = [
    { key: "log_id", label: "รหัสงาน" },
    { key: "room", label: "ห้อง" },
    { key: "type", label: "ประเภท" },
    { key: "technician", label: "ช่าง" },
    { key: "cost", label: "ค่าใช้จ่าย" },
    { key: "status", label: "สถานะงาน" },
    { key: "request_date", label: "วันที่แจ้ง" },
    { key: "completed_date", label: "วันที่เสร็จ" },
  ];

  // ===== Normalize schedules (เก็บ raw + display แยก) =====
  const normalizedSchedules = schedules.map((s) => {
    const prettyCycle = s?.cycleInterval ? String(s.cycleInterval).replace(/_/g, " ") : "-";
    return {
      // raw fields (ใช้ส่งกลับ backend)
      scheduleId: s.scheduleId,
      taskName: s.taskName,
      cycleInterval: s.cycleInterval,
      lastCompleted: s.lastCompleted,
      nextDue: s.nextDue,
      // display (ใช้ render)
      display: {
        task_name: s.taskName || "-",
        cycle: prettyCycle,
        last_completed: s.lastCompleted || "-",
        next_due: s.nextDue || "-",
      },
    };
  });

  return (
    <>
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="mb-0">ซ่อมบำรุง</h3>
            <p className="text-muted mb-0">จัดการงานซ่อมและการบำรุงรักษา</p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (tab === "tickets") {
                setSelectedLog(null);
                setFormOpen(true);
              } else {
                setFormOpenSchedule(true);
              }
            }}
          >
            + สร้างงานใหม่
          </button>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "tickets" ? "active" : ""} cy_maintainance_tab_1`}
              onClick={() => setTab("tickets")}
            >
              งานซ่อม
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${tab === "plan" ? "active" : ""} cy_maintainance_tab_2`}
              onClick={() => setTab("plan")}
            >
              ตารางซ่อมบำรุง
            </button>
          </li>
        </ul>

        {/* Content */}
        {tab === "tickets" ? (
          <div className="card shadow-sm">
            <div className="card-header bg-light p-3">รายการงานซ่อม</div>
            <div className="card-body">
              <TableBS
                columns={logColumns}
                data={normalizedLogs}
                renderCell={(key, value) => {
                  if (key === "status") {
                    return value === "completed" ? (
                      <span className="badge bg-success">เสร็จแล้ว</span>
                    ) : value === "in_progress" ? (
                      <span className="badge bg-warning">กำลังดำเนินการ</span>
                    ) : value === "scheduled" ? (
                      <span className="badge bg-info">วางแผน</span>
                    ) : (
                      value
                    );
                  }
                  if (key === "cost") return `฿${value?.toLocaleString?.() ?? value}`;
                  return value;
                }}
                renderActions={(row) => (
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      const original = logs.find((l) => l.logId === row.log_id);
                      setSelectedLog(original);
                      setFormOpen(true);
                    }}
                  >
                    <i className="bi bi-search"></i>
                  </button>
                )}
              />
            </div>
          </div>
        ) : (
          <div className="card shadow-sm">
            <div className="card-header bg-light p-3">ตารางซ่อมบำรุง</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>งาน</th>
                      <th>ความถี่</th>
                      <th>ครั้งถัดไป</th>
                      <th>ครั้งล่าสุด</th>
                      <th style={{ width: 240 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedSchedules.map((s) => (
                      <tr key={s.scheduleId}>
                        <td>{s.display.task_name}</td>
                        <td>{s.display.cycle}</td>
                        <td>{s.display.next_due}</td>
                        <td>{s.display.last_completed}</td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-sm btn-primary" onClick={() => handleDoNow(s)}>
                              ทำงานตอนนี้
                            </button>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => handleSkip(s)}>
                              ข้ามครั้งนี้
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {normalizedSchedules.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-muted">ยังไม่มีตารางซ่อมบำรุง</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {formOpen && (
        <MaintenanceFormModal
          open={formOpen}
          log={selectedLog}
          onClose={() => setFormOpen(false)}
          onSuccess={reloadLogs}
        />
      )}
      {formOpenSchedule && (
        <MaintenanceScheduleFormModal
          open={formOpenSchedule}
          schedule={null}
          onClose={() => setFormOpenSchedule(false)}
          onSuccess={reloadSchedules}
        />
      )}
    </>
  );
}
