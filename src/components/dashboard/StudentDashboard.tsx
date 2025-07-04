import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, UserCheck, Plus, Eye } from "lucide-react";
import { CreateEvent } from "./CreateEvent";
import { ViewEvents } from "./ViewEvents";
import { ViewVenues } from "./ViewVenues";
import { BrowseEvents } from "./BrowseEvents";

export const StudentDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showViewEvents, setShowViewEvents] = useState(false);
  const [showViewVenues, setShowViewVenues] = useState(false);
  const [showBrowseEvents, setShowBrowseEvents] = useState(false);

  // Real data state
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    registered: 0,
    attended: 0,
    created: 0,
    venues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    const fetchData = async () => {
      try {
        // Fetch events created by the user
        const { data: created, error: createdErr } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", user.id);
        if (createdErr) throw createdErr;
        setMyEvents(created || []);

        // Fetch events the user is registered for
        const { data: regs, error: regsErr } = await supabase
          .from("event_registrations")
          .select("event_id, attendance_status")
          .eq("user_id", user.id);
        if (regsErr) throw regsErr;
        setRegisteredEvents(regs || []);

        // Stats
        setStats({
          registered: regs.length,
          attended: regs.filter((r: any) => r.attendance_status === "attended")
            .length,
          created: created.length,
          venues: created.length, // TODO: Replace with real venue booking count if available
        });
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      student: "STUDENT",
      outsider: "OUTSIDER/GUEST",
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
              Student Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-3 py-1"
              >
                <UserCheck className="h-4 w-4" />
                You are logged in as:{" "}
                {getRoleDisplayName(profile?.role || "student")}
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
                      View Available Venues
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBrowseEvents(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse All Events
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
                    Registered Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.registered}</div>
                  <p className="text-xs text-muted-foreground">
                    Events registered
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Events Attended
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.attended}</div>
                  <p className="text-xs text-muted-foreground">Attended</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Events Created
                  </CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.created}</div>
                  <p className="text-xs text-muted-foreground">
                    Events organized
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
            </div>
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Created Events</CardTitle>
                  <CardDescription>Events you have organized</CardDescription>
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
                  <CardTitle>Registered Events</CardTitle>
                  <CardDescription>
                    Events you're registered for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {registeredEvents.length === 0 ? (
                      <div className="text-gray-500">
                        No registered events yet.
                      </div>
                    ) : (
                      registeredEvents.map((reg) => (
                        <div
                          key={reg.event_id}
                          className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50"
                        >
                          <div>
                            <p className="font-medium">
                              Event ID: {reg.event_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              Status: {reg.attendance_status}
                            </p>
                          </div>
                          <Badge variant="default">Registered</Badge>
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
