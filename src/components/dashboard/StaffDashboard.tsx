import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CreateEvent } from "./CreateEvent";
import { ViewEvents } from "./ViewEvents";
import { ViewVenues } from "./ViewVenues";
import { BrowseEvents } from "./BrowseEvents";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { EventReports } from "./EventReports";
import { EventSettings } from "./EventSettings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  MapPin,
  FileText,
  UserCheck,
  Plus,
  Eye,
  Settings,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EventRecord = Database["public"]["Tables"]["events"]["Row"];

interface Stats {
  myEvents: number;
  registrations: number;
  venues: number;
  pending: number;
}

export const StaffDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showViewEvents, setShowViewEvents] = useState(false);
  const [showViewVenues, setShowViewVenues] = useState(false);
  const [showBrowseEvents, setShowBrowseEvents] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Real data state
  const [myEvents, setMyEvents] = useState<EventRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<EventRecord[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<EventRecord[]>([]);
  const [venues, setVenues] = useState<{ [key: string]: string }>({});
  const [stats, setStats] = useState<Stats>({
    myEvents: 0,
    registrations: 0,
    venues: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const fetchData = async () => {
    if (!user || !profile) return;
    setLoading(true);
    setError("");
    try {
      console.log("[DEBUG] Current user ID:", user.id);
      console.log("[DEBUG] Current user role:", profile.role);

      // Fetch events created by the staff
      const createdRes = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id);

      if (createdRes.error) {
        console.error(
          "[ERROR] Failed to fetch created events:",
          createdRes.error
        );
        throw createdRes.error;
      }

      console.log("[DEBUG] Created events:", createdRes.data);
      setMyEvents(createdRes.data || []);

      // Fetch events for staff approval
      const pendingRes = await supabase
        .from("events")
        .select("*")
        .in("status", ["pending_approval"])
        .or(`staff_assigned_to.eq.${user.id},approver_role.eq.staff`);

      if (pendingRes.error) {
        console.error(
          "[ERROR] Failed to fetch pending approvals:",
          pendingRes.error
        );
        throw pendingRes.error;
      }

      console.log("[DEBUG] Pending staff approvals:", pendingRes.data);
      setPendingApprovals(pendingRes.data || []);

      // Fetch all approved events
      const approvedRes = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("start_date", { ascending: true });

      if (approvedRes.error) {
        console.error(
          "[ERROR] Failed to fetch approved events:",
          approvedRes.error
        );
        throw approvedRes.error;
      }

      console.log("[DEBUG] Approved events:", approvedRes.data);
      setApprovedEvents(approvedRes.data || []);

      // Fetch venues for display
      const allEvents = [
        ...(createdRes.data || []),
        ...(pendingRes.data || []),
        ...(approvedRes.data || []),
      ];
      const uniqueVenueIds = [
        ...new Set(allEvents.map((e) => e.venue_id).filter(Boolean)),
      ];

      if (uniqueVenueIds.length > 0) {
        const { data: venuesData } = await supabase
          .from("venues")
          .select("id, name")
          .in("id", uniqueVenueIds);

        if (venuesData) {
          const venueMap = venuesData.reduce(
            (acc, venue) => {
              acc[venue.id] = venue.name;
              return acc;
            },
            {} as { [key: string]: string }
          );
          setVenues(venueMap);
        }
      }

      // Calculate stats
      const myEventsCount = (createdRes.data || []).length;
      const pendingCount = (pendingRes.data || []).length;

      setStats({
        myEvents: myEventsCount,
        registrations: 0, // TODO: Fetch actual registrations count
        venues: myEventsCount, // Using events count as venues for now
        pending: pendingCount,
      });

      console.log("[DEBUG] Dashboard stats:", {
        myEvents: myEventsCount,
        pending: pendingCount,
      });
    } catch (err) {
      console.error("[ERROR] Error fetching dashboard data:", err);
      setError("Failed to load dashboard data.");
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, profile]);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      staff: "STAFF",
      event_coordinator: "EVENT COORDINATOR",
    };
    return roleMap[role] || role.toUpperCase();
  };

  // Component routing
  if (showCreateEvent) {
    return (
      <CreateEvent
        onBack={() => setShowCreateEvent(false)}
        onSuccess={fetchData}
      />
    );
  }
  if (showViewEvents) {
    return <ViewEvents onBack={() => setShowViewEvents(false)} />;
  }
  if (showViewVenues) {
    return <ViewVenues onBack={() => setShowViewVenues(false)} />;
  }
  if (showBrowseEvents) {
    return <BrowseEvents onBack={() => setShowBrowseEvents(false)} />;
  }
  if (showReports) {
    return <EventReports onBack={() => setShowReports(false)} />;
  }
  if (showSettings) {
    return <EventSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Staff Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-3 py-1"
              >
                <UserCheck className="h-4 w-4" />
                You are logged in as:{" "}
                {getRoleDisplayName(profile?.role || "staff")}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                {profile?.full_name}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="ml-3 text-green-600">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">
            {error}
            <div className="mt-4">
              <Button onClick={fetchData} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">Quick Actions</CardTitle>
                <CardDescription className="text-green-600">
                  Get started with common tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => setShowCreateEvent(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowViewEvents(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View My Events
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowViewVenues(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Check Venue Availability
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBrowseEvents(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse All Events
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowReports(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Event Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    My Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {stats.myEvents}
                  </div>
                  <p className="text-xs text-green-600">Events organized</p>
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Total Registrations
                  </CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {stats.registrations}
                  </div>
                  <p className="text-xs text-green-600">Across all events</p>
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Venues Booked
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {stats.venues}
                  </div>
                  <p className="text-xs text-green-600">This month</p>
                </CardContent>
              </Card>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Pending Approvals
                  </CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">
                    {stats.pending}
                  </div>
                  <p className="text-xs text-green-600">Awaiting review</p>
                </CardContent>
              </Card>
            </div>

            {/* Approval Workflow */}
            <div className="mb-8">
              <ApprovalWorkflow
                events={pendingApprovals}
                onEventUpdated={fetchData}
              />
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-green-800">
                      My Events & Status
                    </CardTitle>
                    <CardDescription className="text-green-600">
                      Track your event approvals and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {myEvents.length === 0 ? (
                        <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                          No events created yet.
                        </div>
                      ) : (
                        myEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {event.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {event.start_date?.slice(0, 10)} •{" "}
                                {venues[event.venue_id] || "TBD"} •{" "}
                                {event.status}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="border-green-200 text-green-700"
                            >
                              {event.status}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="shadow-lg">
                  <CardHeader className="bg-green-50">
                    <CardTitle className="text-green-800">
                      Upcoming Approved Events
                    </CardTitle>
                    <CardDescription className="text-green-600">
                      All approved events happening soon
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {approvedEvents.length === 0 ? (
                        <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                          No approved events yet.
                        </div>
                      ) : (
                        approvedEvents.slice(0, 5).map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {event.title}
                              </p>
                              <p className="text-sm text-gray-600">
                                {event.start_date?.slice(0, 10)} •{" "}
                                {venues[event.venue_id] || "TBD"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge
                                variant="outline"
                                className="border-green-200 text-green-700 bg-green-50"
                              >
                                Approved
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
      {/* Add a Dialog/modal to show full event details when selectedReportEvent is set */}
      <Dialog
        open={!!selectedReportEvent}
        onOpenChange={() => setSelectedReportEvent(null)}
      >
        <DialogContent className="border-emerald-100">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">Event Report</DialogTitle>
          </DialogHeader>
          {selectedReportEvent && (
            <div className="text-gray-700 space-y-2">
              <div>
                <strong>Title:</strong> {selectedReportEvent.title}
              </div>
              <div>
                <strong>Description:</strong> {selectedReportEvent.description}
              </div>
              <div>
                <strong>Date:</strong>{" "}
                {selectedReportEvent.start_date?.slice(0, 10)}
              </div>
              <div>
                <strong>Time:</strong>{" "}
                {selectedReportEvent.start_date?.slice(11, 16)} -{" "}
                {selectedReportEvent.end_date?.slice(11, 16)}
              </div>
              <div>
                <strong>Venue:</strong> {selectedReportEvent.venue_id}
              </div>
              <div>
                <strong>Type:</strong> {selectedReportEvent.event_type}
              </div>
              <div>
                <strong>Max Participants:</strong>{" "}
                {selectedReportEvent.max_participants}
              </div>
              <div>
                <strong>Purpose:</strong> {selectedReportEvent.description}
              </div>
              <div>
                <strong>Status:</strong> {selectedReportEvent.status}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
