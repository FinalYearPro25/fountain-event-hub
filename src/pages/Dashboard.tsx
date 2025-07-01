
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

  // Route based on user_type first, then role for specific permissions
  switch (userType) {
    case "staff":
      return <StaffDashboard />;
    case "student":
      return <StudentDashboard />;
    case "outsider":
      return <StudentDashboard />;
    default:
      // Fallback to role-based routing for admin functions
      switch (userRole) {
        case "super_admin":
        case "senate_member":
          return <AdminDashboard />;
        case "dean":
        case "department_head":
          return <DeanDashboard />;
        case "event_coordinator":
          return <StaffDashboard />;
        default:
          return <StudentDashboard />;
      }
  }
}
