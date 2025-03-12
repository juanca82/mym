import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import UserManagement from "./pages/admin/UserManagement";
import Profile from "./pages/Profile";
import TimeClock from "./pages/Fichaje";
import Incidencias from "./pages/Incidencias";
import Proyectos from "./pages/Proyectos";
import GestionIncidencias from "./pages/GestionIncidencias";
import PaginaTareas from "./pages/Tareas";
import MisTareas from "./pages/Mistareas";
import Reportes from "./pages/Reportes";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useUser } from "./hooks/useUser";
import NavigationRouter from "./components/Navigation";

// Componente de Rutas Privadas
function PrivateRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { session, loading: loadingSession } = useAuth();
  const { user, loading: loadingUser } = useUser();

  if (loadingSession || loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 animate-pulse">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role) {
    const allowedRoles = requiredRole.split(",");
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
}

// Contenido Principal de la App
function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login"; // Ocultar navbar en login

  return (
    <>
      {!hideNavbar && <NavigationRouter />}
      <div className="p-4 pt-16">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* 🔹 Dashboard accesible para MANAGER, SUPERVISOR y WORKER */}
          <Route path="/" element={<PrivateRoute requiredRole="manager,supervisor,worker"><Dashboard /></PrivateRoute>} />

          <Route path="/admin/users" element={<PrivateRoute requiredRole="admin"><UserManagement /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/time-clock" element={<PrivateRoute><TimeClock /></PrivateRoute>} />
          <Route path="/incidents" element={<PrivateRoute><Incidencias /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><Proyectos /></PrivateRoute>} />
          
          {/* 🔹 Supervisores también pueden gestionar incidencias */}
          <Route path="/manage-incidents" element={<PrivateRoute requiredRole="admin,manager,supervisor"><GestionIncidencias /></PrivateRoute>} />

          <Route path="/tasks" element={<PrivateRoute requiredRole="admin,manager,supervisor,worker"><PaginaTareas /></PrivateRoute>} />
          <Route path="/mistareas" element={<PrivateRoute requiredRole="worker"><MisTareas /></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
        </Routes>
      </div>
    </>
  );
}

// Componente Principal App
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;