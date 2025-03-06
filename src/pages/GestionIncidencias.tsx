import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";
import { Loader, Trash2 } from "lucide-react";
import Navigation from "../components/Navigation";

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  image_url?: string;
  created_at: string;
}

export default function GestionIncidencias() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("all");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchUserRole(user.id);
  }, [user]);

  async function fetchUserRole(userId: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!error && data) setRole(data.role);
  }

  useEffect(() => {
    if (!loading && role) {
      if (!["admin", "manager", "supervisor"].includes(role)) {
        navigate("/incidents");
      } else {
        fetchIncidents();
      }
    }
  }, [role, loading, filter]);

  async function fetchIncidents() {
    setFetching(true);
    let query = supabase.from("incidents").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);

    const { data, error } = await query;
    if (!error) setIncidents(data || []);
    setFetching(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("incidents").update({ status }).eq("id", id);
    if (!error) {
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? { ...inc, status } : inc)));
    }
  }

  async function deleteIncident(id: string) {
    if (!window.confirm("¿Estás seguro de eliminar esta incidencia?")) return;
    const { error } = await supabase.from("incidents").delete().eq("id", id);
    if (!error) setIncidents((prev) => prev.filter((inc) => inc.id !== id));
  }

  if (loading || fetching || role === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-gray-500" size={32} />
        <p className="ml-2 text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6">Gestión de Incidencias</h2>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Filtrar por estado:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className="border rounded-lg p-2"
          >
            <option value="all">Todas</option>
            <option value="open">Abiertas</option>
            <option value="in_progress">En proceso</option>
            <option value="resolved">Resueltas</option>
          </select>
        </div>

        <ul className="space-y-4">
          {incidents.map((incident) => (
            <li key={incident.id} className="bg-white p-4 rounded-lg shadow-md">
              <h4 className="font-bold">{incident.title}</h4>
              <p className="text-gray-600">{incident.description}</p>
              {incident.image_url && (
                <img 
                  src={incident.image_url} 
                  alt="Evidencia" 
                  className="w-40 h-auto mt-2 rounded-lg cursor-pointer" 
                  onClick={() => window.open(incident.image_url, "_blank")} 
                />
              )}

              <div className="mt-3">
                <label className="block text-sm font-semibold">Estado:</label>
                <select
                  value={incident.status}
                  onChange={(e) => updateStatus(incident.id, e.target.value)}
                  className="border rounded-lg p-2 w-full"
                  disabled={!["admin", "manager", "supervisor"].includes(role)}
                >
                  <option value="open">Abierta</option>
                  <option value="in_progress">En proceso</option>
                  <option value="resolved">Resuelta</option>
                </select>
              </div>

              {role === "admin" && (
                <button 
                  onClick={() => deleteIncident(incident.id)} 
                  className="mt-3 bg-red-600 text-white px-3 py-1 rounded-lg flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
