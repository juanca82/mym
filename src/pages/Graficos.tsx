import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "../hooks/useUser";
import Navigation from "../components/Navigation.tsx";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  start_date: string;
  deadline: string | null;
}

const COLORS = ["#1E3A8A", "#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6"]; // Azul oscuro

export default function ManagerDashboard() {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      const { data, error } = await supabase.from("projects").select("*");
      if (!error) setProjects(data || []);
      setLoading(false);
    }

    if (user) fetchProjects();
  }, [user]);

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-gray-700 text-center mb-6">📊 Dashboard del Manager</h2>

        {loading ? (
          <div className="flex justify-center py-6">
            <span className="text-gray-500">Cargando proyectos...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div key={project.id} className="bg-white shadow-lg rounded-xl p-6 text-center hover:shadow-2xl transition cursor-pointer">
                <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
                <p className="text-gray-500 text-sm">{project.description}</p>
                <div className="w-full h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ name: "Progreso", value: project.progress }, { name: "Restante", value: 100 - project.progress }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell key="progress" fill={COLORS[index % COLORS.length]} />
                        <Cell key="remaining" fill="#E5E7EB" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-gray-700 font-bold mt-2">{project.progress}% Completado</p>
                <p className="text-gray-500 text-sm">Inicio: {new Date(project.start_date).toLocaleDateString()}</p>
                {project.deadline && <p className="text-gray-500 text-sm">Plazo: {new Date(project.deadline).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}