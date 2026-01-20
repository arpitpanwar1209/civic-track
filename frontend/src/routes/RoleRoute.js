import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function RoleRoute({ allowedRoles, children }) {
  const { user, loading } = useContext(AuthContext);

  // Still resolving auth
  if (loading) return null;

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to correct dashboard
  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={
          user.role === "provider"
            ? "/provider/dashboard"
            : "/consumer/dashboard"
        }
        replace
      />
    );
  }

  return children;
}
