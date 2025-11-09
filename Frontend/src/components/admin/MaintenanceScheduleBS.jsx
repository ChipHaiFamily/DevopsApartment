import React from "react";

export default function MaintenanceScheduleBS({ schedule }) {
  const tasks = schedule ?? [];

  return (
    <div
      className="vstack gap-2 p-2 bg-body custom-scroll"
      style={{ height: 180, overflowY: "auto" }}
    >
      {tasks.map((task) => (
        <div
          key={task.scheduleId}
          className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-body-tertiary"
        >
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-calendar-check text-warning-emphasis" />
            <div>
              <div className="fw-semibold">
                {task.taskName || "Maintenance Task"}
              </div>
              <div className="small text-warning-emphasis">
                ทำครั้งต่อไป:{" "}
                {task.scheduledDate
                  ? new Date(task.scheduledDate).toLocaleDateString("en-GB")
                  : "-"}
              </div>
            </div>
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="text-center text-secondary small py-2">
          ไม่มีตารางการซ่อมบำรุง
        </div>
      )}
    </div>
  );
}
