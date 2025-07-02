
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

  // Get user role and type
  const userRole = profile.role || "student";
  const userType = profile.user_type;

  console.log("Dashboard routing - Role:", userRole, "Type:", userType, "Profile:", profile);

  // Admin roles - super_admin, senate_member
  if (userRole === "super_admin" || userRole === "senate_member") {
    console.log("Routing to AdminDashboard");
    return <AdminDashboard />;
  }

  // Dean roles - dean, department_head
  if (userRole === "dean" || userRole === "department_head") {
    console.log("Routing to DeanDashboard");
    return <DeanDashboard />;
  }

  // Staff roles - Check both role and user_type for staff
  if (userRole === "staff" || userRole === "event_coordinator" || userType === "staff") {
    console.log("Routing to StaffDashboard");
    return <StaffDashboard />;
  }

  // Default to student dashboard
  console.log("Routing to StudentDashboard");
  return <StudentDashboard />;
}
