import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Asegúrate de que la configuración de Supabase esté correcta
import { useUser } from "../hooks/useUser"; // Hook para obtener el usuario logueado
import { Loader } from "lucide-react"; // Icono para tareas en progreso

interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed"; // Usamos el campo 'status' para el estado
  assigned_to: string; // Asignado a un trabajador
}

const PaginaTareas = () => {
  const { user } = useUser(); // Obtener el usuario logueado
  const [tasks, setTasks] = useState<Task[]>([]); // Estado para almacenar las tareas
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    // Función para obtener las tareas asignadas al trabajador
    const fetchTasks = async () => {
      setLoading(true);
      try {
        let query = supabase.from("tasks").select("*");

        // Si el usuario es un trabajador, mostramos solo las tareas asignadas a él
        if (user?.role === "worker") {
          query = query.eq("assigned_to", user.id); // Filtra por el ID del trabajador
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          setTasks(data as Task[]); // Asigna las tareas recuperadas a la variable de estado 'tasks'
        }
      } catch (error) {
        console.error("Error al obtener las tareas:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTasks(); // Solo intenta obtener tareas si el usuario está logueado
    }
  }, [user]);

  // Función para actualizar el estado de una tarea
  const handleTaskStatusChange = async (taskId: string, newStatus: "pending" | "in_progress" | "completed") => {
    try {
      // Actualiza el estado de la tarea en la base de datos
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus }) // Actualiza el campo 'status'
        .eq("id", taskId); // Filtra por el ID de la tarea

      if (error) throw error;

      // Actualiza el estado local para reflejar el cambio de forma instantánea
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error("Error al actualizar la tarea:", error);
    }
  };

  // Mostrar un mensaje de carga mientras se obtienen las tareas
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-center">Tareas Asignadas</h1>

      {/* Lista de tareas */}
      <ul className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-600">No tienes tareas asignadas en este momento.</p>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              className={`p-6 border rounded-lg shadow-md ${task.status === "completed" ? "bg-green-100" : task.status === "in_progress" ? "bg-yellow-100" : "bg-gray-100"} hover:shadow-lg transition`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Cambiar estado de la tarea: pendiente -> en progreso -> completada */}
                  {task.status === "pending" && (
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                      onClick={() => handleTaskStatusChange(task.id, "in_progress")}
                    >
                      Empezar
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <button
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none"
                      onClick={() => handleTaskStatusChange(task.id, "completed")}
                    >
                      Completar
                    </button>
                  )}
                  {task.status === "completed" && (
                    <span className="text-green-500">Completada</span>
                  )}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default PaginaTareas;