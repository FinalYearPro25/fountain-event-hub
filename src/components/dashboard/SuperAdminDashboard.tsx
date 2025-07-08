import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  X,
  Building2,
  Users,
  UserCheck,
  Search,
  Bell,
  Settings,
  MoreHorizontal,
  Shield,
  Filter,
  Calendar,
  FileText,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/components/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const { profile, signOut } = useAuthContext();
  const [pendingRegistrations, setPendingRegistrations] = useState<
    PendingRegistration[]
  >([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  // Add modal state for each feature
  const [openModal, setOpenModal] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const { data: regData } = await supabase
          .from("pending_registrations")
          .select("*")
          .eq("status", "pending");
        setPendingRegistrations(regData || []);
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("*");
        setUserRoles(rolesData || []);
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
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: reg.user_id,
        role: reg.requested_role as Database["public"]["Enums"]["app_role"],
      });
      if (roleError) throw roleError;
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

  const filteredRegistrations = pendingRegistrations.filter(
    (reg) =>
      reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Ventixe</span>
        </div>
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
            <Shield className="h-4 w-4" />
            Super Admin
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => setOpenModal("user-management")}
          >
            <Users className="h-4 w-4" />
            User Management
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => setOpenModal("role-approvals")}
          >
            <UserCheck className="h-4 w-4" />
            Role Approvals
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => setOpenModal("event-oversight")}
          >
            <Calendar className="h-4 w-4" />
            Event Oversight
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => setOpenModal("venue-management")}
          >
            <MapPin className="h-4 w-4" />
            Venue Management
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => setOpenModal("reports")}
          >
            <FileText className="h-4 w-4" />
            Reports
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => setOpenModal("settings")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </div>
          <div
            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => setOpenModal("security")}
          >
            <Shield className="h-4 w-4" />
            Security
          </div>
        </nav>
        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {profile?.full_name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.full_name}
              </p>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="ml-64 min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
        {/* Pending Registrations Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Pending Staff/Dean/Senate Member Registrations
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            {filteredRegistrations.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No pending registrations.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRegistrations.map((reg) => (
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
      {/* Feature Modals */}
      <Dialog open={openModal !== null} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {openModal === "user-management" && "User Management"}
              {openModal === "role-approvals" && "Role Approvals"}
              {openModal === "event-oversight" && "Event Oversight"}
              {openModal === "venue-management" && "Venue Management"}
              {openModal === "reports" && "Reports"}
              {openModal === "settings" && "Settings"}
              {openModal === "security" && "Security"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-gray-600">
            Feature coming soon or not yet implemented.
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
