import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import TenantLayout from "./layouts/TenantLayout.jsx";

import DashboardBS from "./pages/admin/DashboardBS.jsx";
import RoomsManage from "./pages/admin/RoomManagement/RoomsManage.jsx";
import AdminInvoicesPage from "./pages/admin/Invoices/AdminInvoicesPage.jsx";
import AdminLeasesPage from "./pages/admin/Contracts/AdminLeasesPage.jsx";
import AdminTenantsPage from "./pages/admin/Tenants/AdminTenantsPage.jsx";
import AdminReportsPage from "./pages/admin/Reports/AdminReportsPage.jsx";
import MaintenancePage from "./pages/admin/Maintenance/MaintenancePage.jsx";
import RequestPage from "./pages/admin/Reservation/RequestPage.jsx";
import RequestDetailPage from "./pages/admin/Reservation/RequestDetailPage.jsx";
import AdminPaymentPage from "./pages/admin/Payment/AdminPaymentPage.jsx";
import AdminUsagePage from "./pages/admin/Usage/AdminUsagePage.jsx";
import AdminSupplyPage from "./pages/admin/Supply/AdminSupplyPage.jsx";

import RoomDetailBS from "./pages/admin/RoomDetailBS";

import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import SettingPage from "./pages/admin/SettingsPage.jsx";
import Room from "./pages/Room.jsx";

import TenantOverviewPage from "./pages/tenant/TenantOverviewPage.jsx";
import TenantInvoicePage from "./pages/tenant/TenantInvoicePage.jsx";
import TenantMaintainPage from "./pages/tenant/TenantMaintainPage.jsx";

import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter(
  [
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/rooms/:type?", element: <Room /> },

    {
      path: "/tenant/:roomId",
      element: (
        <ProtectedRoute role="USER">
          <TenantLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <TenantOverviewPage /> },
        { path: "invoices", element: <TenantInvoicePage /> },
        { path: "maintain", element: <TenantMaintainPage /> },
      ],
    },

    {
      path: "/admin",
      element: (
        <ProtectedRoute role="ADMIN">
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashboardBS /> },
        { path: "invoices", element: <AdminInvoicesPage /> },
        { path: "maintenance", element: <MaintenancePage /> },
        { path: "settings", element: <SettingPage /> },
        { path: "requests", element: <RequestPage /> },
        { path: "requests/:id", element: <RequestDetailPage /> },
        { path: "rooms", element: <RoomsManage /> },
        { path: "rooms/:roomId", element: <RoomDetailBS /> },
        { path: "leases", element: <AdminLeasesPage /> },
        { path: "tenants", element: <AdminTenantsPage /> },
        { path: "reports", element: <AdminReportsPage /> },
        { path: "payments", element: <AdminPaymentPage /> },
        { path: "usage", element: <AdminUsagePage /> },
        { path: "supply", element: <AdminSupplyPage /> },
      ],
    },
  ],
  {
    basename: "/chiphaifamily-frontend",
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
