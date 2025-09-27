import React from "react";

const Icon = ({ path }) => (
  <div className="stat__icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d={path} fill="currentColor" />
    </svg>
  </div>
);

export default function Stats() {
  const stats = [
    {
      label: "ห้องทั้งหมด",
      value: 24,
      icon: "M3 3h18v2H3V3zm2 5h14v13H5V8zm3 3v7h2v-7H8zm4 0v7h2v-7h-2zm4 0v7h2v-7h-2z"
    },
    {
      label: "ห้องว่าง",
      value: 12,
      icon: "M4 7h16v10H4V7zm2 2v6h12V9H6zM3 5h18V3H3v2z"
    },
    {
      label: "ผู้เช่าปัจจุบัน",
      value: 19,
      icon: "M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 1118 0H3z"
    },
  ];

  return (
    <div className="stats-wrap">
      <div className="container stats">
        {stats.map((s, i) => (
          <div key={i} className="stat">
            <Icon path={s.icon} />
            <div>
              <p className="stat__value">{s.value}</p>
              <p className="stat__label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}