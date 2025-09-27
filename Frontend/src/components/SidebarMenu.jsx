import React from 'react';
import { NavLink } from 'react-router-dom';

/** เมนู + ไอคอน (bootstrap-icons) */
const MENU = [
  { key: 'dashboard',   label: 'แดชบอร์ด',   to: '/admin',            icon: 'bi-house' },
  { key: 'rooms',       label: 'จัดการห้อง', to: '/admin/rooms',       icon: 'bi-building' },
  { key: 'requests',     label: 'คำขอเช่า', to: '/admin/requests',     icon: 'bi-tags' },
  { key: 'tenants',     label: 'ผู้เช่า',     to: '/admin/tenants',     icon: 'bi-people' },
  { key: 'leases',      label: 'สัญญาเช่า',   to: '/admin/leases',      icon: 'bi-file-text' },
  { key: 'invoices',    label: 'ใบแจ้งหนี้', to: '/admin/invoices',    icon: 'bi-receipt' },
  { key: 'maintenance', label: 'ซ่อมบำรุง',   to: '/admin/maintenance', icon: 'bi-wrench' },
  { key: 'reports',     label: 'รายงาน',      to: '/admin/reports',     icon: 'bi-bar-chart' },
  // { key: 'banners',     label: 'แบนเนอร์',    to: '/admin/banners',     icon: 'bi-image' },
  { key: 'settings',    label: 'ตั้งค่า',      to: '/admin/settings',    icon: 'bi-gear' },
//   { key: 'logout',      label: 'ออกจากระบบ',  to: '/logout',            icon: 'bi-box-arrow-right', danger: true },
];

export default function SidebarMenu() {
  return (
    <aside className="sb shadow-sm">
      <div className="sb__inner">
        {/* โลโก้ / ชื่อระบบ */}
        {/* <div className="sb__brand">DevOps Apartment</div> */}

        {/* เมนู */}
        <nav className="sb__nav">
          {MENU.map(item => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `sb__item ${isActive ? 'is-active' : ''} ${item.danger ? 'is-danger' : ''}`
              }
              end={item.key === 'dashboard'}
            >
              <span className={`sb__icon ${item.danger ? 'text-danger-subtle' : ''}`}>
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