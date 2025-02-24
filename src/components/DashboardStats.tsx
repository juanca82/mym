import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStatsProps {
  totalHours: number;
  projectProgress: number;
  incidentStats: {
    open: number;
    inProgress: number;
    resolved: number;
  };
}

export function DashboardStats({ totalHours, projectProgress, incidentStats }: DashboardStatsProps) {
  const hoursData = {
    labels: ['Total Hours Worked'],
    datasets: [
      {
        label: 'Hours',
        data: [totalHours],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const progressData = {
    labels: ['Progress', 'Remaining'],
    datasets: [
      {
        data: [projectProgress, 100 - projectProgress],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(201, 203, 207, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const incidentData = {
    labels: ['Open', 'In Progress', 'Resolved'],
    datasets: [
      {
        data: [
          incidentStats.open,
          incidentStats.inProgress,
          incidentStats.resolved,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Total Hours Worked</h3>
        <Bar
          data={hoursData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
          }}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
        <Doughnut
          data={progressData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
            },
          }}
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Incidents Status</h3>
        <Doughnut
          data={incidentData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' },
            },
          }}
        />
      </div>
    </div>
  );
}