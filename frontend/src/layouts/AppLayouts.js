import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import FabReport from "../components/FabReport";

export default function AppLayout() {
  const location = useLocation();

  // Hide FAB on pages where it should not appear
  const hideFab =
    location.pathname.startsWith("/issues/submit") ||
    location.pathname.startsWith("/profile");

  return (
    <>
      {/* Top navigation */}
      <AppNavbar />

      {/* Main content area */}
      <main className="app-content">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      {!hideFab && <FabReport />}
    </>
  );
}
