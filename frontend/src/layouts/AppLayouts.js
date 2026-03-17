import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import FabReport from "../components/FabReport";

export default function AppLayout() {
  const location = useLocation();

  // Hide FAB on pages where it should not appear (forms, profile, auth)
  const hideFab =
    location.pathname.startsWith("/issues/submit") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      
      {/* Top Enterprise Navigation */}
      <AppNavbar />

      {/* Main Content Area - Flex-grow ensures the footer (if added) pushes to the bottom */}
      <main className="flex-grow-1 d-flex flex-column position-relative">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      {!hideFab && <FabReport />}
      
    </div>
  );
}