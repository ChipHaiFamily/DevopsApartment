import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import TenantSidebarMenu from "../components/TenantSidebarMenu";
import Footer from "../components/Footer";
// import { useAuth } from "../contexts/AuthContext";

const TenantLayout = () => {
  // const { user, logout } = useAuth();
  const user = { name: "Tenant" }; // <- mock ชั่วคราว
  const logout = () => alert("mock logout");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <TenantSidebarMenu />
            </div>
          </div>
        </div>
      </div>

{/* Content (Topbar + Outlet + Footer) */}
    <div className="flex flex-col w-0 flex-1 overflow-hidden min-h-screen">
      {/* Topbar */}
      <Navbar mode="tenant" onLogout={logout} />

      {/* Routed content */}
      <main className="flex-grow relative overflow-y-auto focus:outline-none">
        <div className="py-6">
          <Outlet />
        </div>
      </main>

      {/* Footer (ชิดล่างเสมอ) */}
      <Footer />
      </div>
    </div>
  );
};

export default TenantLayout;
