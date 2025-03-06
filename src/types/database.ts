export type UserRole = 'admin' | 'manager' | 'supervisor' | 'worker';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  start_date: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  user_profiles?: UserProfile; // Relación con el usuario asignado
  projects?: Project; // Relación con el proyecto
}

export interface TimeEntry {
  id: string;
  user_id: string;
  check_in: string;
  break_start: string | null;
  break_end: string | null;
  check_out: string | null;
  total_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  project_id: string;
  reported_by: string;
  title: string;
  description: string;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
}