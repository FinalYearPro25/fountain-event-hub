import { useAuthContext } from "@/components/auth/AuthProvider";
import { Navigate } from "react-router-dom";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { HODDashboard } from "@/components/dashboard/HODDashboard";
import { DeanDashboard } from "@/components/dashboard/DeanDashboard";
import { StudentAffairsDashboard } from "@/components/dashboard/StudentAffairsDashboard";
import { VCDashboard } from "@/components/dashboard/VCDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";

export default function Dashboard() {
  const { user, profile, loading } = useAuthContext();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;

  const userRole = profile?.role;

  // Super Admin
  if (userRole === "super_admin") {
    return <SuperAdminDashboard />;
  }
  // VC (SuperAdmin, Senate Member)
  if (userRole === "vc" || userRole === "senate_member") {
    return <VCDashboard />;
  }
  // Dean of Student Affairs
  if (userRole === "dean_student_affairs") {
    return <StudentAffairsDashboard />;
  }
  // Dean
  if (userRole === "dean") {
    return <DeanDashboard />;
  }
  // HOD
  if (userRole === "department_head") {
    return <HODDashboard />;
  }
  // Staff
  if (userRole === "staff" || userRole === "event_coordinator") {
    return <StaffDashboard />;
  }
  // Outsider or fallback
  return <StudentDashboard />;
}
