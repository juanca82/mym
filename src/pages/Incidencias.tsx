import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";
import { Loader, PlusCircle, X } from "lucide-react";
import Navigation from "../components/Navigation";

interface Incident {
  id: string;
  project_id: string;
  project_name?: string;
  reported_by: string;
  title: string;
  description: string;
  status: string;
  image_url?: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function Incidencias() {
  const { user } = useUser();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchIncidents();
    }
  }, [user]);

  async function fetchProjects() {
    const { data, error } = await supabase.from("projects").select("id, name");
    if (!error) setProjects(data);
  }

  async function fetchIncidents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("incidents")
      .select("*, projects(name)")
      .eq("reported_by", user?.id)
      .order("created_at", { ascending: false });

    if (!error) {
      const updatedIncidents = data.map((incident) => ({
        ...incident,
        project_name: incident.projects?.name || "Desconocido",
      }));
      setIncidents(updatedIncidents);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !projectId) return;

    setSubmitting(true);
    let imageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `incidents/${user?.id}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from("incidents").upload(filePath, imageFile);
      if (error) {
        console.error("Error al subir la imagen:", error.message);
      } else {
        const { data } = supabase.storage.from("incidents").getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("incidents")
      .insert([{ title, description, reported_by: user?.id, project_id: projectId, image_url: imageUrl }])
      .select("*, projects(name)")
      .single();

    if (!error) {
      const newIncident = {
        ...data,
        project_name: data.projects?.name || "Desconocido",
      };
      setIncidents([newIncident, ...incidents]);
      setTitle("");
      setDescription("");
      setProjectId("");
      setImageFile(null);
    }
    setSubmitting(false);
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6">Reportar Incidencia</h2>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block font-semibold mb-1">Proyecto</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full border rounded-lg p-2" required>
              <option value="">Selecciona un proyecto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Título</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded-lg p-2" required />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg p-2" rows={3} required></textarea>
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-1">Subir Imagen</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full border rounded-lg p-2" />
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center disabled:bg-gray-400" disabled={submitting}>
            <PlusCircle className="h-5 w-5 mr-2" />
            {submitting ? "Enviando..." : "Reportar"}
          </button>
        </form>

        <h3 className="text-xl font-semibold mb-4">Mis Incidencias</h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader className="animate-spin text-gray-500" size={32} />
          </div>
        ) : incidents.length > 0 ? (
          <ul className="space-y-4">
            {incidents.map((incident) => (
              <li key={incident.id} className="bg-white p-4 rounded-lg shadow-md">
                <h4 className="font-bold">{incident.title}</h4>
                <p className="text-gray-600">{incident.description}</p>
                {incident.image_url && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={incident.image_url}
                      alt="Imagen de la incidencia"
                      className="max-w-[150px] h-auto rounded-lg shadow-md object-cover cursor-pointer"
                      onClick={() => setSelectedImage(incident.image_url ?? null)}
                    />
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Proyecto: <span className="font-semibold">{incident.project_name}</span> <br />
                  Estado: <span className="font-semibold">{incident.status}</span> | {new Date(incident.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No has reportado incidencias aún.</p>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center" onClick={() => setSelectedImage(null)}>
          <div className="relative">
            <button className="absolute top-2 right-2 text-white bg-black p-1 rounded-full" onClick={() => setSelectedImage(null)}>
              <X size={24} />
            </button>
            <img src={selectedImage} alt="Imagen ampliada" className="max-w-full max-h-[90vh] rounded-lg" />
          </div>
        </div>
      )}
    </>
  );
}