import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut, User, Clock, AlertTriangle, FolderPlus, ClipboardList, FileText, ShieldCheck, Menu
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";

export default function Navigation() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // Definir botones por rol
  const rolePermissions = {
    worker: ["/time-clock", "/incidents", "/profile", "/my-tasks"],
    supervisor: ["/time-clock", "/manage-incidents", "/tasks", "/my-tasks", "/profile", "/projects"],
    manager: ["/manage-incidents", "/tasks", "/reportes", "/profile", "/projects"],
  };

  type UserRole = "worker" | "supervisor" | "manager";
  const userRole: UserRole = user?.role as UserRole || "worker";
  const allowedRoutes = rolePermissions[userRole] || [];

  // Función para cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Cerrar menú en móviles
  const closeMenu = () => setMenuOpen(false);

  // Componente reutilizable para los enlaces de navegación
  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    allowedRoutes.includes(to) && (
      <Link to={to} className="nav-link" onClick={closeMenu}>
        <Icon className="h-5 w-5 mr-2" />
        {label}
      </Link>
    )
  );

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Botón de menú en móviles */}
          <div className="flex items-center">
            <button className="md:hidden text-gray-700 focus:outline-none mr-4" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="text-xl font-bold text-gray-900 flex items-center">
              <img src="/logo-mym-formentera.jpg" alt="Logo" className="h-8 w-auto mr-2" />
              Dashboard
            </Link>
          </div>

          {/* Menú de navegación */}
          <div className={`md:flex md:items-center md:space-x-6 ${menuOpen ? "block" : "hidden"} md:block`}>
            <div className="flex flex-col md:flex-row md:space-x-6 bg-white md:bg-transparent shadow-md md:shadow-none absolute md:relative top-16 md:top-0 left-0 w-full md:w-auto p-4 md:p-0">
              {/* Links principales según rol */}
              <NavItem to="/time-clock" icon={Clock} label="Fichar Horas" />
              <NavItem to="/incidents" icon={AlertTriangle} label="Reportar Incidencia" />
              <NavItem to="/profile" icon={User} label="Perfil" />
              <NavItem to="/my-tasks" icon={ClipboardList} label="Mis Tareas" />
              <NavItem to="/manage-incidents" icon={ShieldCheck} label="Gestionar Incidencias" />
              <NavItem to="/tasks" icon={ClipboardList} label="Asignar Tareas" />
              <NavItem to="/projects" icon={FolderPlus} label="Crear Proyecto" />
              <NavItem to="/reportes" icon={FileText} label="Ver Reportes" />

              {/* Botón de cerrar sesión */}
              <button onClick={() => { handleLogout(); closeMenu(); }} className="nav-link">
                <LogOut className="h-5 w-5 mr-2" /> Salir
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
          transition: color 0.3s ease-in-out;
          padding: 0.5rem 0;
        }
        .nav-link:hover {
          color: #1d4ed8;
        }
      `}</style>
    </nav>
  );
}