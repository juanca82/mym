import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../hooks/useUser";
import Navigation from "./Navigation";

export default function PrivateRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { session, loading: loadingSession } = useAuth();
  const { user, loading: loadingUser } = useUser();

  if (loadingSession || loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role) {
    const allowedRoles = requiredRole.split(",");
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="pt-20 flex-grow">{children}</div> {/* Ajuste para evitar solapamiento */}
    </div>
  );
}