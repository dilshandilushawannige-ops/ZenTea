import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allow }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-emerald-600 font-semibold">Loading...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allow) {
    const normalizedRole = user?.role ? user.role.toString().trim().toLowerCase() : "";
    const normalizedAllow = allow.map((r) => r.toString().trim().toLowerCase());
    const isAllowed = normalizedAllow.some((allowedRole) =>
      normalizedRole === allowedRole ||
      normalizedRole.includes(allowedRole) ||
      allowedRole.includes(normalizedRole)
    );
    if (!isAllowed) return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
