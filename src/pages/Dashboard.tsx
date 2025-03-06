import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../hooks/useUser";

interface SummaryData {
  totalProjects: number;
  totalHours: number;
  openIncidents: number;
  assignedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

const Dashboard = () => {
  const { session, loading: loadingSession } = useAuth();
  const { user, loading: loadingUser } = useUser();

  const [summary, setSummary] = useState<SummaryData>({
    totalProjects: 0,
    totalHours: 0,
    openIncidents: 0,
    assignedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      if (!user) return;

      try {
        const { role } = user;
        let totalProjects = 0;
        let totalHours = 0;
        let openIncidents = 0;
        let assignedTasks = 0;
        let pendingTasks = 0;
        let inProgressTasks = 0;
        let completedTasks = 0;

        if (role === "manager") {
          const { data: projects, error: projectError } = await supabase.from("projects").select("id");
          if (projectError) throw projectError;
          totalProjects = projects?.length || 0;

          const currentMonth = new Date().toISOString().slice(0, 7);
          const { data: hoursData, error: hoursError } = await supabase
            .from("time_entries")
            .select("check_in, total_hours");
          if (hoursError) throw hoursError;
          totalHours = hoursData
            ?.filter((entry) => entry.check_in?.startsWith(currentMonth))
            .reduce((acc, entry) => acc + (entry.total_hours || 0), 0) || 0;

          const { data: incidents, error: incidentsError } = await supabase.from("incidents").select("status");
          if (incidentsError) throw incidentsError;
          openIncidents = incidents?.filter((inc) => ["open", "in_progress"].includes(inc.status)).length || 0;
        }

        if (role === "worker") {
          const { data: tasks, error: tasksError } = await supabase
            .from("tasks")
            .select("id, status")
            .eq("assigned_to", user.id);

          if (tasksError) throw tasksError;
          assignedTasks = tasks?.length || 0;
          pendingTasks = tasks?.filter((task) => task.status === "pending").length || 0;
          inProgressTasks = tasks?.filter((task) => task.status === "in_progress").length || 0;
          completedTasks = tasks?.filter((task) => task.status === "completed").length || 0;
        }

        // ✅ Solución aplicada: Mantener propiedades previas y actualizar solo tareas
        setSummary((prev) => ({
          ...prev,
          assignedTasks,
          pendingTasks,
          inProgressTasks,
          completedTasks,
          totalProjects,
          totalHours,
          openIncidents,
        }));
      } catch (error) {
        console.error("Error obteniendo los datos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [user]);

  if (loadingSession || loadingUser || loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  if (!session) return <Navigate to="/login" />;

  const role = user?.role;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {role === "manager" && (
          <>
            <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center justify-center">
              <span className="text-4xl mb-2">📊</span>
              <h3 className="text-lg font-semibold">Proyectos</h3>
              <p className="text-2xl font-bold">{summary.totalProjects}</p>
              <p className="text-gray-500 text-sm">Proyectos disponibles</p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center justify-center">
              <span className="text-4xl mb-2">⏰</span>
              <h3 className="text-lg font-semibold">Horas</h3>
              <p className="text-2xl font-bold">{summary.totalHours}</p>
              <p className="text-gray-500 text-sm">Horas trabajadas este mes</p>
            </div>

            <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center justify-center">
              <span className="text-4xl mb-2">⚠️</span>
              <h3 className="text-lg font-semibold">Incidencias Abiertas</h3>
              <p className="text-2xl font-bold">{summary.openIncidents}</p>
              <p className="text-gray-500 text-sm">Incidencias abiertas o en progreso</p>
            </div>
          </>
        )}

        {role === "worker" && (
          <>
            <div
              className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-2xl transition cursor-pointer"
              onClick={() => (window.location.href = "/mistareas")}
            >
              <span className="text-4xl mb-2">⏳</span>
              <h3 className="text-lg font-semibold">Pendientes</h3>
              <p className="text-2xl font-bold">{summary.pendingTasks}</p>
              <p className="text-gray-500 text-sm">Tareas pendientes</p>
            </div>

            <div
              className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-2xl transition cursor-pointer"
              onClick={() => (window.location.href = "/mistareas")}
            >
              <span className="text-4xl mb-2">🔄</span>
              <h3 className="text-lg font-semibold">En Progreso</h3>
              <p className="text-2xl font-bold">{summary.inProgressTasks}</p>
              <p className="text-gray-500 text-sm">Tareas en progreso</p>
            </div>

            <div
              className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-2xl transition cursor-pointer"
              onClick={() => (window.location.href = "/mistareas")}
            >
              <span className="text-4xl mb-2">✅</span>
              <h3 className="text-lg font-semibold">Completadas</h3>
              <p className="text-2xl font-bold">{summary.completedTasks}</p>
              <p className="text-gray-500 text-sm">Tareas completadas</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;