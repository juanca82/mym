import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Loader, PlusCircle, Edit, Trash2 } from "lucide-react";
import Navigation from "../components/Navigation";

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  start_date: string;
  deadline: string;
  created_at: string;
}

export default function Proyectos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estado para crear/editar
  const [projectId, setProjectId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");

  // Estado del modal de eliminación
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });

    if (!error) setProjects(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !startDate || !deadline || progress < 0 || progress > 100) return;

    setSubmitting(true);
    
    if (projectId) {
      const { error } = await supabase
        .from("projects")
        .update({ name, description, progress, start_date: startDate, deadline })
        .eq("id", projectId);

      if (!error) {
        setProjects((prevProjects) =>
          prevProjects.map((p) => (p.id === projectId ? { ...p, name, description, progress, start_date: startDate, deadline } : p))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("projects")
        .insert([{ name, description, progress, start_date: startDate, deadline }])
        .select()
        .single();

      if (!error) {
        setProjects([data, ...projects]);
      }
    }

    resetForm();
    setSubmitting(false);
  }

  function handleDeleteClick(project: Project) {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  }

  async function confirmDelete() {
    if (!projectToDelete) return;
    const { error } = await supabase.from("projects").delete().eq("id", projectToDelete.id);

    if (!error) {
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectToDelete.id));
    }

    setDeleteModalOpen(false);
    setProjectToDelete(null);
  }

  function handleEdit(project: Project) {
    setProjectId(project.id);
    setName(project.name);
    setDescription(project.description);
    setProgress(project.progress);
    setStartDate(project.start_date);
    setDeadline(project.deadline);
  }

  function resetForm() {
    setProjectId(null);
    setName("");
    setDescription("");
    setProgress(0);
    setStartDate("");
    setDeadline("");
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6">{projectId ? "Editar Proyecto" : "Crear Proyecto"}</h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block font-semibold mb-1">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg p-2" required />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg p-2" rows={3}></textarea>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Progreso (%)</label>
            <input type="number" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="w-full border rounded-lg p-2" min="0" max="100" required />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Fecha de Inicio</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded-lg p-2" required />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Fecha Límite</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full border rounded-lg p-2" required />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center disabled:bg-gray-400" disabled={submitting}>
            <PlusCircle className="h-5 w-5 mr-2" />
            {submitting ? "Guardando..." : projectId ? "Actualizar" : "Crear Proyecto"}
          </button>
        </form>

        <h3 className="text-xl font-semibold mb-4">Proyectos Creados</h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader className="animate-spin text-gray-500" size={32} />
          </div>
        ) : (
          <ul className="space-y-4">
            {projects.map((project) => (
              <li key={project.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h4 className="font-bold">{project.name}</h4>
                  <p className="text-gray-600">{project.description || "Sin descripción"}</p>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => handleEdit(project)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeleteClick(project)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-lg font-semibold">¿Eliminar este proyecto?</h2>
            <p className="text-gray-600">{projectToDelete?.name}</p>
            <div className="flex justify-center mt-4 space-x-4">
              <button onClick={() => setDeleteModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-lg">Cancelar</button>
              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}