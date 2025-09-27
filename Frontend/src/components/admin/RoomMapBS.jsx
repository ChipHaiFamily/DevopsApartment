import React from "react";

const statusClass = (s) =>
  s === "available"
    ? "room--ava"
    : s === "occupied"
    ? "room--occ"
    : "room--mnt";

export default function RoomMapBS({ rooms, floors = [1, 2], onRoomClick }) {
  const groups = floors.map((f) => ({
    floor: f,
    items: rooms.filter((r) => r.floor === f),
  }));

  return (
    <>
      {groups.map((g) => (
        <div key={g.floor} className="mb-3">
          <div className="text-secondary small mb-2">ชั้น {g.floor}</div>
          <div className="d-grid room-grid">
            {g.items.map((r) => (
              <div
                key={r.roomNum}
                className={`room ${statusClass(r.status)}`}
                onClick={() => onRoomClick && onRoomClick(r)}
                style={{ cursor: "pointer" }}
              >
                <div className="room__num fw-bold">{r.roomNum}</div>
                <div className="room__type text-muted p-2">
                    {(r.roomTypeName || r.roomType?.name || "-").replace("Studio", "").trim()}
                </div>
                <div className="badge rounded-pill room__badge">
                  {r.status === "available"
                    ? "ว่าง"
                    : r.status === "occupied"
                    ? "ไม่ว่าง"
                    : "ซ่อม"}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="d-flex gap-3 text-secondary small">
        {/* <span><i className="legend legend--occ" /> พักอยู่</span> */}
        <span>
          <i className="legend" style={{ backgroundColor: "red" }} /> พักอยู่
        </span>
        <span>
          <i className="legend legend--ava" /> ว่าง
        </span>
        <span>
          <i className="legend legend--mnt" /> ซ่อม
        </span>
      </div>
    </>
  );
}
