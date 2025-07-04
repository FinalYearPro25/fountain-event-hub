import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";

interface PendingRegistration {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  requested_role: string;
  status: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
}

export const SuperAdminDashboard = () => {
  const [pendingRegistrations, setPendingRegistrations] = useState<
    PendingRegistration[]
  >([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch pending registrations
        const { data: regData } = await supabase
          .from("pending_registrations")
          .select("*")
          .eq("status", "pending");
        setPendingRegistrations(regData || []);
        // Fetch user roles
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("*");
        setUserRoles(rolesData || []);
        // Fetch user profiles
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email, full_name");
        setProfiles(profilesData || []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allowedRoles: Database["public"]["Enums"]["app_role"][] = [
    "super_admin",
    "senate_member",
    "dean",
    "department_head",
    "event_coordinator",
    "student",
    "staff",
    "outsider",
    "dean_student_affairs",
  ];

  const handleApproveRegistration = async (reg: PendingRegistration) => {
    setLoading(true);
    try {
      // Validate requested_role
      if (
        !allowedRoles.includes(
          reg.requested_role as Database["public"]["Enums"]["app_role"]
        )
      ) {
        toast({
          title: "Invalid Role",
          description: `Role '${reg.requested_role}' is not allowed for assignment!`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      // Insert user role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: reg.user_id,
        role: reg.requested_role as Database["public"]["Enums"]["app_role"],
      });
      if (roleError) throw roleError;
      // Update registration status
      const { error: updateError } = await supabase
        .from("pending_registrations")
        .update({ status: "approved" })
        .eq("id", reg.id);
      if (updateError) throw updateError;
      setPendingRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
      toast({
        title: "Registration Approved",
        description: `${reg.full_name} is now a ${reg.requested_role === "senate_member" ? "Senate Member" : reg.requested_role}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve registration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRegistration = async (reg: PendingRegistration) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("pending_registrations")
        .update({ status: "rejected" })
        .eq("id", reg.id);
      if (error) throw error;
      setPendingRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
      toast({
        title: "Registration Rejected",
        description: `${reg.full_name}'s registration was rejected.`,
        variant: "destructive",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject registration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
        {/* Pending Registrations Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Pending Staff/Dean/Senate Member Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRegistrations.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No pending registrations.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{reg.full_name}</div>
                      <div className="text-xs text-gray-500">
                        {reg.email} • {reg.requested_role}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveRegistration(reg)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectRegistration(reg)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* User Roles Section */}
        <Card>
          <CardHeader>
            <CardTitle>All Users & Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Full Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {userRoles.map((role) => {
                    const profile = profiles.find((p) => p.id === role.user_id);
                    return (
                      <tr key={role.id} className="border-b">
                        <td className="p-2">
                          {profile?.full_name || role.user_id}
                        </td>
                        <td className="p-2">{profile?.email || "-"}</td>
                        <td className="p-2">
                          <Badge>{role.role}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
