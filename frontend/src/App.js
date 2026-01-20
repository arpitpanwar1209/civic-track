import "./App.css";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import ToasterProvider from "./components/Toaster";

// Guards
import PrivateRoute from "./routes/PrivateRoute";
import RoleRoute from "./routes/RoleRoute";

// Pages
import Home from "./pages/home";
import Issues from "./pages/issue";
import IssueDetail from "./pages/IssueDetail";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Profile from "./pages/profile";
import EditIssue from "./pages/EditIssue";
import ResetPassword from "./pages/ResetPassword";

// Dashboards
import ConsumerDashboard from "./pages/dashboard/ConsumerDashboard";
import ProducerDashboard from "./pages/dashboard/ProviderDashboard";

// Layout
import AppLayout from "./layouts/AppLayouts";

function App() {
  return (
    <ToasterProvider>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/reset-password/:uid/:token"
          element={<ResetPassword />}
        />

        {/* ================= PROTECTED ================= */}
        <Route
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          {/* -------- DASHBOARDS -------- */}
          <Route
            path="/consumer/dashboard"
            element={
              <RoleRoute allowedRoles={["consumer"]}>
                <ConsumerDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/provider/dashboard"
            element={
              <RoleRoute allowedRoles={["provider"]}>
                <ProducerDashboard />
              </RoleRoute>
            }
          />

          {/* -------- PROFILE (BOTH) -------- */}
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={["consumer", "provider"]}>
                <Profile />
              </RoleRoute>
            }
          />

          {/* -------- ISSUES (BOTH) -------- */}
          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetail />} />

          {/* -------- EDIT ISSUE (CONSUMER ONLY) -------- */}
          <Route
            path="/issues/:id/edit"
            element={
              <RoleRoute allowedRoles={["consumer"]}>
                <EditIssue />
              </RoleRoute>
            }
          />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </ToasterProvider>
  );
}

export default App;
