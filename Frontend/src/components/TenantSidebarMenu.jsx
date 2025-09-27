import React from "react";
import { NavLink, useParams } from "react-router-dom";
export default function TenantSidebarMenu() {
  const { roomId } = useParams(); // ดึงค่าห้องจาก URL

  /** เมนู + ไอคอน สำหรับผู้เช่า */
  const TENANT_MENU = [
    { key: "tenant", label: "ภาพรวม", to: `/tenant/${roomId}`, icon: "bi-house" },
    {
      key: "invoices",
      label: "บิลของฉัน",
      to: `/tenant/${roomId}/invoices`,
      icon: "bi-receipt",
    },
    {
      key: "maintain",
      label: "ซ่อมแซม",
      to: `/tenant/${roomId}/maintain`,
      icon: "bi-wrench",
    },
    {
      key: "leases",
      label: "สัญญาเช่า",
      to: `/tenant/${roomId}/profile`,
      icon: "bi-person",
    },
    //   { key: 'logout',    label: 'ออกจากระบบ',     to: '/logout',           icon: 'bi-box-arrow-right', danger: true },
  ];

  return (
    <aside className="sb shadow-sm">
      <div className="sb__inner">
        {/* เมนู */}
        <nav className="sb__nav">
          {TENANT_MENU.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `sb__item ${isActive ? "is-active" : ""} ${
                  item.danger ? "is-danger" : ""
                }`
              }
              end={item.key === "tenant"}
            >
              <span
                className={`sb__icon ${
                  item.danger ? "text-danger-subtle" : ""
                }`}
              >
                <i className={`${item.icon}`}></i>
              </span>
              <span className="sb__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
