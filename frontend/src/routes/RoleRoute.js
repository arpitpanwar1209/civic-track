// src/routes/RoleRoute.jsx

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function RoleRoute({ allowedRoles, children }) {

  const { user, loading } = useContext(AuthContext);

  // Auth still loading
  if (loading) {
    return null; // PrivateRoute already shows loader
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User has wrong role
  if (!allowedRoles.includes(user.role)) {

    const redirectPath =
      user.role === "provider"
        ? "/provider-dashboard"
        : "/dashboard";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
}