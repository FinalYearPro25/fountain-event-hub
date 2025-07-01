
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Navigate } from "react-router-dom";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DeanDashboard } from "@/components/dashboard/DeanDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";

export default function Dashboard() {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Wait for profile to load before rendering dashboard
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Route based on user role and user_type
  const userRole = profile.role || "student";
  const userType = profile.user_type;

  console.log("User routing - Role:", userRole, "Type:", userType, "Profile:", profile);

  // First check for admin roles
  if (userRole === "super_admin" || userRole === "senate_member") {
    return <AdminDashboard />;
  }

  // Then check for dean roles
  if (userRole === "dean" || userRole === "department_head") {
    return <DeanDashboard />;
  }

  // Then check for staff roles or event coordinators
  if (userRole === "event_coordinator" || userType === "staff") {
    return <StaffDashboard />;
  }

  // Default to student dashboard for students and outsiders
  return <StudentDashboard />;
}
