
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DeanDashboard } from '@/components/dashboard/DeanDashboard';
import { StaffDashboard } from '@/components/dashboard/StaffDashboard';

export default function Dashboard() {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  // Route based on user role
  switch (profile.role) {
    case 'super_admin':
    case 'senate_member':
      return <AdminDashboard />;
    case 'dean':
    case 'department_head':
      return <DeanDashboard />;
    case 'staff':
    case 'event_coordinator':
      return <StaffDashboard />;
    case 'student':
    case 'outsider':
    default:
      return <StudentDashboard />;
  }
}
