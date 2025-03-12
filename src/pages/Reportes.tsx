import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// 📌 Interfaces
interface TimeReport {
  user_id: string;
  full_name: string;
  month: string;
  total_hours: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  start_date: string;
  deadline: string;
}

const Reportes = () => {
  const [timeReports, setTimeReports] = useState<TimeReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // 📌 Cargar datos de reportes de usuarios desde Supabase
  useEffect(() => {
    const fetchTimeReports = async () => {
      const { data, error } = await supabase
        .from("user_time_reports")
        .select("user_id, full_name, month, total_hours")
        .eq("month", selectedMonth);

      if (error) {
        console.error("❌ Error al cargar reportes:", error.message);
      } else {
        console.log("✅ Reportes cargados:", data);
        setTimeReports(data || []);
      }
    };

    fetchTimeReports();
  }, [selectedMonth]);

  // 📌 Cargar datos de proyectos desde Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from("projects").select("id, name, description, progress, start_date, deadline");

      if (error) {
        console.error("❌ Error al cargar proyectos:", error.message);
      } else {
        console.log("✅ Proyectos cargados:", data);
        setProjects(data || []);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">📊 Reportes de Horas Trabajadas</h1>

      {/* 📅 Seleccionar Mes */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium">Seleccionar mes:</label>
        <input
          type="month"
          className="border p-2 rounded w-full"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* 📊 Gráfico de barras */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-center mb-2">Horas trabajadas por usuario</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeReports}>
            <XAxis dataKey="full_name" stroke="#4B5563" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total_hours" fill="#3B82F6" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📝 Lista de horas trabajadas */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Detalles de horas trabajadas</h2>
        <ul className="mt-2 border border-gray-300 rounded-md">
          {timeReports.length > 0 ? (
            timeReports.map((entry) => (
              <li key={entry.user_id} className="border-b p-2 flex justify-between">
                <span>{entry.full_name}</span>
                <span className="font-semibold">{entry.total_hours} hrs</span>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No hay datos disponibles.</li>
          )}
        </ul>
      </div>

      {/* 📂 Sección de Proyectos */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">📁 Proyectos</h2>

        {/* Cuadros de información de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-100 rounded-lg shadow">
            <h3 className="text-lg font-semibold">📌 Total de Proyectos</h3>
            <p className="text-xl font-bold">{projects.length}</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg shadow">
            <h3 className="text-lg font-semibold">✅ Proyectos Completados</h3>
            <p className="text-xl font-bold">{projects.filter(p => p.progress === 100).length}</p>
          </div>
          <div className="p-4 bg-yellow-100 rounded-lg shadow">
            <h3 className="text-lg font-semibold">🚀 En progreso</h3>
            <p className="text-xl font-bold">{projects.filter(p => p.progress > 0 && p.progress < 100).length}</p>
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Lista de proyectos</h2>
          <ul className="mt-2 border border-gray-300 rounded-md">
            {projects.length > 0 ? (
              projects.map((project) => (
                <li key={project.id} className="border-b p-4">
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <p className="text-gray-600">{project.description}</p>
                  <p className="text-sm text-gray-500">
                    📅 Inicio: {new Date(project.start_date).toLocaleDateString()} - ⏳ Límite: {new Date(project.deadline).toLocaleDateString()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">Progreso: {project.progress}%</p>
                </li>
              ))
            ) : (
              <li className="p-4 text-gray-500">No hay proyectos disponibles.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reportes;