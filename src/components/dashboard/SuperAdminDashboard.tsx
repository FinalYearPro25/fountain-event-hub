
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
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/components/auth/AuthProvider";

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
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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
      if (!allowedRoles.includes(reg.requested_role as Database["public"]["Enums"]["app_role"])) {
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

  const filteredRegistrations = pendingRegistrations.filter(reg =>
    reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = userRoles.length;
  const totalPending = pendingRegistrations.length;

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
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <Users className="h-4 w-4" />
            User Management
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <UserCheck className="h-4 w-4" />
            Role Approvals
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <Calendar className="h-4 w-4" />
            System Overview
          </div>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Hello {profile?.full_name?.split(' ')[0]}, manage your system!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users, roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-gray-50 border-gray-200"
                />
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {totalPending > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    {totalPending}
                  </span>
                )}
              </Button>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {profile?.full_name?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Pending Registrations</CardTitle>
                <UserCheck className="h-4 w-4 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPending}</div>
                <p className="text-xs opacity-90">Require approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                <p className="text-xs text-gray-600">Active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">System Health</CardTitle>
                <Shield className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">98%</div>
                <p className="text-xs text-gray-600">All systems operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Active Roles</CardTitle>
                <FileText className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{allowedRoles.length}</div>
                <p className="text-xs text-gray-600">Available roles</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Registrations */}
          <Card className="border-0 shadow-sm mb-8">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Pending Role Registrations</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Staff/Dean/Senate Member registration requests</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <p className="ml-3 text-gray-600">Loading registrations...</p>
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <UserCheck className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Registrations</h3>
                  <p className="text-gray-600">All registration requests have been processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{reg.full_name}</h4>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <span>{reg.email}</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                              {reg.requested_role.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs">
                              {new Date(reg.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => handleApproveRegistration(reg)}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => handleRejectRegistration(reg)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Roles Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-gray-900">All Users & Roles</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Complete system user overview</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-medium text-gray-700">Full Name</th>
                      <th className="text-left p-3 font-medium text-gray-700">Email</th>
                      <th className="text-left p-3 font-medium text-gray-700">Role</th>
                      <th className="text-left p-3 font-medium text-gray-700">Date Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userRoles.map((role) => {
                      const profile = profiles.find((p) => p.id === role.user_id);
                      return (
                        <tr key={role.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">
                            {profile?.full_name || role.user_id}
                          </td>
                          <td className="p-3 text-gray-600">{profile?.email || "-"}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="font-medium">
                              {role.role.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-500">
                            {new Date(role.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};
