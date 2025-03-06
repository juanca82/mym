import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Task, UserProfile, Project } from "../types/database";

const Tareas: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned_to: "",
    project_id: "",
    status: "pending" as "pending" | "in_progress" | "completed",
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchProjects();
    fetchUserRole();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, user_profiles(full_name), projects(name)")
      .order("created_at", { ascending: false });
    if (!error) setTasks(data);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("user_profiles").select("*");
    if (!error) setUsers(data.filter((user) => user.role === "worker"));
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*");
    if (!error) setProjects(data);
  };

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase.from("user_profiles").select("role").eq("id", user.id).single();
      if (!error) setUserRole(data.role);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== "supervisor" && userRole !== "manager") {
      alert("No tienes permisos para asignar tareas.");
      return;
    }

    const { title, description, assigned_to, project_id, status } = newTask;
    if (!title || !assigned_to || !project_id) {
      alert("Por favor complete todos los campos.");
      return;
    }

    const { error } = await supabase.from("tasks").insert([
      { title, description, assigned_to, project_id, status, created_at: new Date(), updated_at: new Date() },
    ]);
    if (!error) {
      fetchTasks();
      setNewTask({ title: "", description: "", assigned_to: "", project_id: "", status: "pending" });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-semibold text-center mb-6">Asignar y Gestionar Tareas</h1>

      {userRole === "supervisor" || userRole === "manager" ? (
        <form onSubmit={handleAssignTask} className="mb-6 bg-white p-6 rounded-lg shadow-lg space-y-4">
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            required
            placeholder="Título"
            className="w-full p-3 border rounded-md"
          />
          <input
            type="text"
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Descripción"
            className="w-full p-3 border rounded-md"
          />
          <select
            name="assigned_to"
            value={newTask.assigned_to}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-md"
          >
            <option value="">Selecciona un trabajador</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
          <select
            name="project_id"
            value={newTask.project_id}
            onChange={handleInputChange}
            required
            className="w-full p-3 border rounded-md"
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600">
            Asignar tarea
          </button>
        </form>
      ) : (
        <p className="text-center text-red-500">No tienes permisos para asignar tareas.</p>
      )}

      {/* Tabla de Tareas */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded-lg shadow-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
              <th className="py-3 px-4 text-left">Título</th>
              <th className="py-3 px-4 text-left hidden sm:table-cell">Descripción</th>
              <th className="py-3 px-4 text-left">Asignado a</th>
              <th className="py-3 px-4 text-left hidden md:table-cell">Proyecto</th>
              <th className="py-3 px-4 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4 text-left">{task.title}</td>
                <td className="py-3 px-4 text-left hidden sm:table-cell">{task.description}</td>
                <td className="py-3 px-4 text-left">{task.user_profiles?.full_name || "Desconocido"}</td>
                <td className="py-3 px-4 text-left hidden md:table-cell">{task.projects?.name || "No asignado"}</td>
                <td className="py-3 px-4 text-left">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      task.status === "pending"
                        ? "bg-yellow-300 text-yellow-900"
                        : task.status === "in_progress"
                        ? "bg-blue-300 text-blue-900"
                        : "bg-green-300 text-green-900"
                    }`}
                  >
                    {task.status === "pending"
                      ? "Pendiente"
                      : task.status === "in_progress"
                      ? "En progreso"
                      : "Completado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tareas;