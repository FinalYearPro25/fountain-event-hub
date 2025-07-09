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

  if (loading || !profile) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;

  const userRole = profile.role;

  // Super Admin
  if (userRole === "super_admin") {
    return <SuperAdminDashboard />;
  }
  // Senate Member (handles VC functionality)
  if (userRole === "senate_member") {
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
  // Staff and Event Coordinator
  if (userRole === "staff" || userRole === "event_coordinator") {
    return <StaffDashboard />;
  }
  // Student or fallback
  return <StudentDashboard />;
}
