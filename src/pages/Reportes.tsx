import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// 📌 Interfaces para tipar correctamente los datos
interface Employee {
  id: string;
  full_name: string;
}

interface TimeEntry {
  user_id: string;
  full_name: string;
  total_hours: number;
  date: string;
}

const Reportes = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("2024-03"); // 📅 Mes actual por defecto

  // 📌 Cargar empleados desde Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase.from("user_profiles").select("id, full_name");

      if (error) {
        console.error("❌ Error al cargar empleados:", error.message);
      } else {
        console.log("✅ Empleados cargados:", data);
        setEmployees(data || []);
      }
    };
    fetchEmployees();
  }, []);

  // 📌 Cargar registros de tiempo desde Supabase
  useEffect(() => {
    const fetchTimeEntries = async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("user_id, total_hours, check_in, user_profiles!inner (full_name)") // 🔥 Corregido el JOIN con alias
        .gte("check_in", `${selectedMonth}-01`)
        .lte("check_in", `${selectedMonth}-31`)
        .order("check_in", { ascending: true });

      if (error) {
        console.error("❌ Error al cargar horas:", error.message);
      } else {
        console.log("📊 Datos recibidos:", data);

        // ✅ Formatear datos correctamente, asegurando que `full_name` se obtiene correctamente
        const formattedData: TimeEntry[] = data.map((entry) => ({
          user_id: entry.user_id,
          full_name: entry.user_profiles?.[0]?.full_name || "Desconocido", // 🔥 Corregido para acceder bien al nombre
          total_hours: entry.total_hours || 0, // 🔥 Asegurar que siempre haya un valor
          date: entry.check_in.split("T")[0], // ✅ Formatear fecha
        }));

        setTimeEntries(formattedData);
      }
    };
    fetchTimeEntries();
  }, [selectedMonth]);

  // 📌 Filtrar datos por empleado si está seleccionado
  const filteredData = selectedEmployee
    ? timeEntries.filter((entry) => entry.user_id === selectedEmployee)
    : timeEntries;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Reportes de Horas Trabajadas</h1>

      {/* 📅 Seleccionar Mes */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Seleccionar mes:</label>
        <input
          type="month"
          className="border p-2 rounded w-full"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
      </div>

      {/* 🏷️ Seleccionar Empleado */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium">Filtrar por empleado:</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
        >
          <option value="">Todos</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* 📊 Gráfico de barras */}
      <div className="mt-6 bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-center mb-2">Horas trabajadas por empleado</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
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
          {filteredData.length > 0 ? (
            filteredData.map((entry) => (
              <li key={`${entry.user_id}-${entry.date}`} className="border-b p-2 flex justify-between">
                <span>{entry.full_name} - {entry.date}</span>
                <span className="font-semibold">{entry.total_hours} hrs</span>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No hay datos disponibles.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Reportes;