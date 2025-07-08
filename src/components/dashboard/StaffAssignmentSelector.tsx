
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";

interface StaffMember {
  id: string;
  full_name: string;
  role: string;
  department?: string;
}

interface StaffAssignmentSelectorProps {
  onAssignStaff: (staffId: string) => void;
  selectedStaffId?: string;
  eventType: string;
}

export const StaffAssignmentSelector = ({
  onAssignStaff,
  selectedStaffId,
  eventType,
}: StaffAssignmentSelectorProps) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffMembers = async () => {
      try {
        // Get staff members, event coordinators, and department heads
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .in("role", ["staff", "event_coordinator", "department_head", "dean", "dean_student_affairs"]);

        if (userRoles) {
          const userIds = userRoles.map((ur) => ur.user_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, department")
            .in("id", userIds);

          if (profiles) {
            const staffWithRoles = profiles.map((profile) => {
              const userRole = userRoles.find((ur) => ur.user_id === profile.id);
              return {
                ...profile,
                role: userRole?.role || "staff",
              };
            });

            setStaffMembers(staffWithRoles);
          }
        }
      } catch (error) {
        console.error("Error fetching staff members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMembers();
  }, []);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      staff: "Staff",
      event_coordinator: "Event Coordinator",
      department_head: "Department Head",
      dean: "Dean",
      dean_student_affairs: "Dean of Student Affairs",
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Staff for Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading staff members...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assign Staff for Approval
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {staffMembers.map((staff) => (
            <div
              key={staff.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedStaffId === staff.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onAssignStaff(staff.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">{staff.full_name}</p>
                    {staff.department && (
                      <p className="text-xs text-gray-500">{staff.department}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getRoleDisplayName(staff.role)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        {staffMembers.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No staff members available for assignment
          </div>
        )}
      </CardContent>
    </Card>
  );
};
