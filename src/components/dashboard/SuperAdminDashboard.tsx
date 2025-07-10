
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
  Settings,
  Shield,
  Filter,
  Calendar,
  FileText,
  MapPin,
  Download,
  Plus,
  Edit,
  Trash2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  user_type: string;
  department?: string;
}

interface Event {
  id: string;
  title: string;
  status: string;
  organizer_id: string;
  start_date: string;
  event_type: string;
}

interface Venue {
  id: string;
  name: string;
  capacity: number;
  venue_type: string;
  is_active: boolean;
}

export const SuperAdminDashboard = () => {
  const { profile, signOut } = useAuthContext();
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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

        // Fetch profiles
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, email, full_name, user_type, department");
        setProfiles(profilesData || []);

        // Fetch events
        const { data: eventsData } = await supabase
          .from("events")
          .select("id, title, status, organizer_id, start_date, event_type");
        setEvents(eventsData || []);

        // Fetch venues
        const { data: venuesData } = await supabase
          .from("venues")
          .select("id, name, capacity, venue_type, is_active");
        setVenues(venuesData || []);
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

  const exportData = (data: any[], filename: string) => {
    const csv = [
      Object.keys(data[0] || {}).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRegistrations = pendingRegistrations.filter(
    (reg) =>
      reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Ventixe</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
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
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
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
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Venues</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{venues.filter(v => v.is_active).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Registrations Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pending Staff/Dean/Senate Member Registrations</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => exportData(pendingRegistrations, 'pending_registrations')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
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
                        className="bg-emerald-600 hover:bg-emerald-700"
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
            <div className="flex justify-between items-center">
              <CardTitle>All Users & Roles</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => exportData(userRoles.map(role => ({
                  ...role,
                  user_name: profiles.find(p => p.id === role.user_id)?.full_name || 'Unknown',
                  user_email: profiles.find(p => p.id === role.user_id)?.email || 'Unknown'
                })), 'user_roles')}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>User Type</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRoles.map((role) => {
                    const profile = profiles.find((p) => p.id === role.user_id);
                    return (
                      <TableRow key={role.id}>
                        <TableCell>{profile?.full_name || role.user_id}</TableCell>
                        <TableCell>{profile?.email || "-"}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-100 text-emerald-700">{role.role}</Badge>
                        </TableCell>
                        <TableCell>{profile?.user_type || "-"}</TableCell>
                        <TableCell>{profile?.department || "-"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Modals */}
      <Dialog open={openModal !== null} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {openModal === "user-management" && "User Management"}
              {openModal === "event-oversight" && "Event Oversight"}
              {openModal === "venue-management" && "Venue Management"}
              {openModal === "reports" && "System Reports"}
              {openModal === "settings" && "System Settings"}
            </DialogTitle>
          </DialogHeader>
          
          {openModal === "user-management" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Users</h3>
                <Button 
                  onClick={() => exportData(profiles, 'all_users')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Export Users
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.full_name}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>
                        <Badge>{profile.user_type}</Badge>
                      </TableCell>
                      <TableCell>{profile.department || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {openModal === "event-oversight" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Events</h3>
                <Button 
                  onClick={() => exportData(events, 'all_events')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Export Events
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.event_type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(event.start_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {openModal === "venue-management" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">All Venues</h3>
                <Button 
                  onClick={() => exportData(venues, 'all_venues')}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Export Venues
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {venues.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell>{venue.name}</TableCell>
                      <TableCell>{venue.venue_type}</TableCell>
                      <TableCell>{venue.capacity}</TableCell>
                      <TableCell>
                        <Badge className={venue.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {venue.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {openModal === "reports" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">System Reports</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">User Activity Report</h4>
                  <p className="text-sm text-gray-600 mb-3">Export all user activity and registration data</p>
                  <Button 
                    onClick={() => exportData(profiles, 'user_activity_report')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Event Analytics Report</h4>
                  <p className="text-sm text-gray-600 mb-3">Export event statistics and performance data</p>
                  <Button 
                    onClick={() => exportData(events, 'event_analytics_report')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {openModal === "settings" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">System Settings</h3>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Application Configuration</h4>
                  <p className="text-sm text-gray-600 mb-3">Manage system-wide settings and configurations</p>
                  <Button variant="outline" className="mr-2">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Security Settings</h4>
                  <p className="text-sm text-gray-600 mb-3">Manage authentication and security policies</p>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Panel
                  </Button>
                </Card>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
