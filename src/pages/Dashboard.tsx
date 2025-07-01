import { useAuthContext } from "@/components/auth/AuthProvider";
import { Navigate } from "react-router-dom";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { DeanDashboard } from "@/components/dashboard/DeanDashboard";
import { StaffDashboard } from "@/components/dashboard/StaffDashboard";
import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue";

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

  // Route based on user role
  const userRole = profile.role || "student";

  // Show ApprovalQueue for approver roles
  if (
    [
      "super_admin",
      "senate_member",
      "dean",
      "department_head",
      "event_coordinator",
    ].includes(userRole)
  ) {
    return <ApprovalQueue />;
  }

  switch (userRole) {
    case "super_admin":
    case "senate_member":
      return <AdminDashboard />;
    case "dean":
    case "department_head":
      return <DeanDashboard />;
    case "staff":
    case "event_coordinator":
      return <StaffDashboard />;
    case "student":
    case "outsider":
    default:
      return <StudentDashboard />;
  }
}
