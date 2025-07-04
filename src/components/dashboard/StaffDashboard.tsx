import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CreateEvent } from "./CreateEvent";
import { ViewEvents } from "./ViewEvents";
import { ViewVenues } from "./ViewVenues";
import { BrowseEvents } from "./BrowseEvents";
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

// Type definitions for Staff Dashboard
interface Event {
  id: string;
  title: string;
  start_date?: string;
  venue_id?: string;
  status?: string;
  organizer_id?: string;
  department?: string;
  [key: string]: any;
}

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

  // Real data state
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({
    myEvents: 0,
    registrations: 0,
    venues: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    const fetchData = async () => {
      try {
        // Fetch events created by the staff
        const { data: created, error: createdErr } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", user.id);
        if (createdErr) throw createdErr;
        setMyEvents(created || []);

        // Fetch pending approvals (events with status 'pending_approval' in staff's department)
        let department = profile?.department;
        let pending: Event[] = [];
        if (department) {
          const { data: pendingData, error: pendingErr } = await supabase
            .from("events")
            .select("*")
            .eq("status", "pending_approval")
            .eq("department", department);
          if (pendingErr) throw pendingErr;
          pending = pendingData || [];
        }
        setPendingApprovals(pending);

        // Stats
        setStats({
          myEvents: created.length,
          registrations: 0, // TODO: Fetch staff event registrations if needed
          venues: created.length, // TODO: Replace with real venue booking count if available
          pending: pending.length,
        });
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, profile]);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      staff: "STAFF",
      event_coordinator: "EVENT COORDINATOR",
    };
    return roleMap[role] || role.toUpperCase();
  };

  if (showCreateEvent) {
    return <CreateEvent onBack={() => setShowCreateEvent(false)} />;
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Role Confirmation */}
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Get started with common tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={() => setShowCreateEvent(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Event
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowViewEvents(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View My Events
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowViewVenues(true)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Check Venue Availability
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBrowseEvents(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse All Events
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Event Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.myEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    Events organized
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Registrations
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.registrations}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all events
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Venues Booked
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.venues}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Approvals
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>
            </div>
            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Events & Status</CardTitle>
                  <CardDescription>
                    Track your event approvals and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myEvents.length === 0 ? (
                      <div className="text-gray-500">
                        No events created yet.
                      </div>
                    ) : (
                      myEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50"
                        >
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-gray-600">
                              {event.start_date?.slice(0, 10)} •{" "}
                              {event.venue_id} • {event.status}
                            </p>
                          </div>
                          <Badge variant="outline">{event.status}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>
                    Events in your department awaiting approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingApprovals.length === 0 ? (
                      <div className="text-gray-500">No pending approvals.</div>
                    ) : (
                      pendingApprovals.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 border-l-4 border-yellow-500 bg-yellow-50"
                        >
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-gray-600">
                              {event.start_date?.slice(0, 10)} •{" "}
                              {event.venue_id} • {event.status}
                            </p>
                          </div>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
