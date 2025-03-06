import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Task } from "../types/database";

// Asegúrate de que esta línea refleje la estructura de tu base de datos
type TaskStatus = "pending" | "in_progress" | "completed";

const MisTareas: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const fetchUserTasks = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("tasks")
        .select("*, projects(name)")
        .eq("assigned_to", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error obteniendo tareas:", error);
    }
    setLoading(false);
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      // Actualizar la UI sin necesidad de recargar
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus as TaskStatus } : task
        )
      );
    } catch (error) {
      console.error("Error actualizando el estado de la tarea:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-semibold text-center mb-6">Mis Tareas</h1>

      {loading ? (
        <p className="text-center">Cargando tareas...</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tienes tareas asignadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                <th className="py-3 px-4 text-left">Título</th>
                <th className="py-3 px-4 text-left hidden sm:table-cell">Descripción</th>
                <th className="py-3 px-4 text-left">Proyecto</th>
                <th className="py-3 px-4 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4 text-left">{task.title}</td>
                  <td className="py-3 px-4 text-left hidden sm:table-cell">{task.description}</td>
                  <td className="py-3 px-4 text-left">{task.projects?.name || "No asignado"}</td>
                  <td className="py-3 px-4 text-left">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="border rounded p-1 text-sm"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MisTareas;