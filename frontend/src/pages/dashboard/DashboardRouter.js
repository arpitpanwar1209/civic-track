// src/pages/dashboard/DashboardRouter.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";

import ConsumerDashboard from "./ConsumerDashboard";
import ProviderDashboard from "./ProviderDashboard";

export default function DashboardRouter() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "provider":
      return <ProviderDashboard />;

    case "consumer":
      return <ConsumerDashboard />;

    default:
      return <Navigate to="/" replace />;
  }
}
