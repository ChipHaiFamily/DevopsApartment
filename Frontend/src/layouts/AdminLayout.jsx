import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";
import SidebarMenu from "../components/SidebarMenu";

const AdminLayout = () => {
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "ผู้ดูแล";

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <SidebarMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Content (Topbar + Outlet) */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Topbar */}
        <Navbar
          mode={role === "ADMIN" ? "admin" : "public"}
          userName={userName}
          onLogout={logout}
        />

        {/* Routed content */}
        <main
          className="flex-1 overflow-y-auto bg-gray-50"
          style={{
            height: "calc(100vh - 64px)", // ลบความสูง Navbar ออก
          }}
        >
          <div className="py-6 px-4 md:px-8 overflow-y-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
