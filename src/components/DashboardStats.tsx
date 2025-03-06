import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend);

interface DashboardStatsProps {
  projectStatuses: { name: string; progress: number }[];
  weeklyHours: { week: string; hours: number }[];
  incidentStats: { open: number; inProgress: number; resolved: number };
}

export function DashboardStats({ projectStatuses, weeklyHours, incidentStats }: DashboardStatsProps) {
  // 🎯 Datos para el gráfico de proyectos (Doughnut Chart)
  const projectData = {
    labels: projectStatuses.map((proj) => proj.name),
    datasets: [
      {
        data: projectStatuses.map((proj) => proj.progress),
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#4BC0C0', '#9966FF'],
      },
    ],
  };

  // 🎯 Datos para el gráfico de horas trabajadas (Bar Chart)
  const hoursData = {
    labels: weeklyHours.map((week) => week.week),
    datasets: [
      {
        label: 'Horas trabajadas',
        data: weeklyHours.map((week) => week.hours),
        backgroundColor: ['#36A2EB'],
      },
    ],
  };

  // 🎯 Datos para el gráfico de incidencias (Bar Chart horizontal)
  const incidentData = {
    labels: ['Abiertas', 'En Progreso', 'Resueltas'],
    datasets: [
      {
        label: 'Incidencias',
        data: [incidentStats.open, incidentStats.inProgress, incidentStats.resolved],
        backgroundColor: ['#FF6384', '#FFCE56', '#36A2EB'],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Estado de Proyectos */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">📊 Estado de Proyectos</h3>
        <div className="w-56 h-56">
          <Doughnut data={projectData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Horas trabajadas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">⏳ Horas Trabajadas por Semana</h3>
        <div className="h-40">
          <Bar data={hoursData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Gestión de Incidencias */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">⚠️ Gestión de Incidencias</h3>
        <div className="h-40">
          <Bar data={incidentData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}