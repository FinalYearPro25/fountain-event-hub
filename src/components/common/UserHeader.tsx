
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, User } from "lucide-react";

interface UserHeaderProps {
  title: string;
  subtitle?: string;
}

export const UserHeader = ({ title, subtitle }: UserHeaderProps) => {
  const { profile, signOut } = useAuthContext();

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      super_admin: "SUPER ADMIN",
      senate_member: "SENATE MEMBER",
      dean: "DEAN",
      dean_student_affairs: "DEAN OF STUDENT AFFAIRS",
      department_head: "HEAD OF DEPARTMENT",
      event_coordinator: "EVENT COORDINATOR",
      staff: "STAFF",
      student: "STUDENT",
      outsider: "OUTSIDER",
    };
    return roleMap[role] || role.toUpperCase();
  };

  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {profile?.full_name || "User"}
              </span>
            </div>
            <Badge
              variant="outline"
              className="flex items-center gap-1 px-3 py-1 border-blue-200 text-blue-700"
            >
              <UserCheck className="h-3 w-3" />
              {getRoleDisplayName(profile?.role || "student")}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={signOut} className="text-gray-600">
          Sign Out
        </Button>
      </div>
    </div>
  );
};
