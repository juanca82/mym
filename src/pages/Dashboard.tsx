import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, ClipboardList, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useUser } from '../hooks/useUser';
import { DashboardStats } from '../components/DashboardStats';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [stats, setStats] = useState({
    totalHours: 0,
    projectProgress: 0,
    incidentStats: {
      open: 0,
      inProgress: 0,
      resolved: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        // Fetch time entries
        const { data: timeEntries } = await supabase
          .from('time_entries')
          .select('total_hours');
        
        // Fetch projects
        const { data: projects } = await supabase
          .from('projects')
          .select('progress');
        
        // Fetch incidents
        const { data: incidents } = await supabase
          .from('incidents')
          .select('status');

        // Calculate stats
        const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
        const avgProgress = projects?.length 
          ? projects.reduce((sum, proj) => sum + proj.progress, 0) / projects.length 
          : 0;
        
        const incidentCounts = {
          open: incidents?.filter(i => i.status === 'open').length || 0,
          inProgress: incidents?.filter(i => i.status === 'in_progress').length || 0,
          resolved: incidents?.filter(i => i.status === 'resolved').length || 0,
        };

        setStats({
          totalHours,
          projectProgress: avgProgress,
          incidentStats: incidentCounts,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard {user?.role && `(${user.role.charAt(0).toUpperCase() + user.role.slice(1)})`}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="px-4 py-6 sm:px-0">
          <DashboardStats
            totalHours={stats.totalHours}
            projectProgress={stats.projectProgress}
            incidentStats={stats.incidentStats}
          />
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <button
                  onClick={() => navigate('/projects/new')}
                  className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Project
                </button>
              )}
              
              {(user?.role === 'admin' || user?.role === 'supervisor') && (
                <button
                  onClick={() => navigate('/tasks')}
                  className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                >
                  <ClipboardList className="h-5 w-5 mr-2" />
                  Manage Tasks
                </button>
              )}
              
              <button
                onClick={() => navigate('/time-entries')}
                className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
              >
                <Clock className="h-5 w-5 mr-2" />
                Time Entry
              </button>
              
              <button
                onClick={() => navigate('/incidents')}
                className="flex items-center justify-center p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Report Incident
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}