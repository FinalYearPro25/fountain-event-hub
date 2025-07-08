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
  BookOpen,
  Award,
  Clock,
  TrendingUp,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  start_date?: string;
  venue_id?: string;
  status?: string;
  organizer_id?: string;
  [key: string]: any;
}

interface Stats {
  myEvents: number;
  registrations: number;
  venues: number;
  pending: number;
}

export const StudentDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showViewEvents, setShowViewEvents] = useState(false);
  const [showViewVenues, setShowViewVenues] = useState(false);
  const [showBrowseEvents, setShowBrowseEvents] = useState(false);

  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({
    myEvents: 0,
    registrations: 0,
    venues: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    const fetchData = async () => {
      try {
        const [
          { data: created, error: createdErr },
          { data: venuesData, error: venuesErr },
          { data: approved, error: approvedErr },
        ] = await Promise.all([
          supabase.from("events").select("*").eq("organizer_id", user.id),
          supabase.from("venues").select("*").eq("is_active", true),
          supabase
            .from("events")
            .select("*")
            .eq("status", "approved")
            .order("start_date", { ascending: true }),
        ]);
        if (createdErr) throw createdErr;
        setMyEvents(created || []);
        if (venuesErr) throw venuesErr;
        setStats({
          myEvents: created?.length || 0,
          registrations: registeredEvents.length,
          venues: venuesData?.length || 0,
          pending:
            created?.filter(
              (e) => e.status === "pending_approval" || e.status === "draft"
            ).length || 0,
        });
        setApprovedEvents(approved || []);
      } catch (err) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, registeredEvents.length]);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Student Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border-green-200"
              >
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">Student</span>
              </Badge>
              <Badge className="px-4 py-2 bg-green-100 text-green-800 border-green-200">
                {profile?.full_name}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={signOut}
            className="px-6 py-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          >
            Sign Out
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-green-700 font-medium">
                Loading your dashboard...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              {error}
            </div>
          </div>
        ) : (
          <>
            {/* Quick Actions */}
            <Card className="mb-8 shadow-soft border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <BookOpen className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Get started with common student tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => setShowCreateEvent(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium shadow-soft hover:shadow-green transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowViewEvents(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View My Events
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowViewVenues(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Check Venues
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBrowseEvents(true)}
                    className="border-green-200 text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Events
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-soft border-0 bg-white/80 backdrop-blur-sm hover:shadow-green transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    My Events
                  </CardTitle>
                  <Calendar className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    {stats.myEvents}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    Events created
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 bg-white/80 backdrop-blur-sm hover:shadow-green transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Registrations
                  </CardTitle>
                  <Users className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    {stats.registrations}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    Events joined
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 bg-white/80 backdrop-blur-sm hover:shadow-green transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Available Venues
                  </CardTitle>
                  <MapPin className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    {stats.venues}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    Campus locations
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 bg-white/80 backdrop-blur-sm hover:shadow-green transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">
                    Pending
                  </CardTitle>
                  <Clock className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-700">
                    {stats.pending}
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    Awaiting approval
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-soft border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Award className="h-5 w-5" />
                    My Events
                  </CardTitle>
                  <CardDescription>
                    Track your created events and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium mb-2">
                          No events created yet
                        </p>
                        <p className="text-sm">
                          Create your first event to get started
                        </p>
                      </div>
                    ) : (
                      myEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="p-4 border border-green-100 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {event.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {event.start_date?.slice(0, 10)} •{" "}
                                {event.venue_id}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                event.status === "approved"
                                  ? "border-green-200 text-green-700 bg-green-50"
                                  : event.status === "pending_approval"
                                    ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                                    : "border-gray-200 text-gray-700 bg-gray-50"
                              }`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="h-5 w-5" />
                    Registered Events
                  </CardTitle>
                  <CardDescription>
                    Events you've registered to attend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {registeredEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium mb-2">No registrations yet</p>
                        <p className="text-sm">
                          Browse events to find interesting activities
                        </p>
                      </div>
                    ) : (
                      registeredEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="p-4 border border-green-100 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {event.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {event.start_date?.slice(0, 10)} •{" "}
                              {event.venue_id}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Calendar className="h-5 w-5" />
                    Upcoming Approved Events
                  </CardTitle>
                  <CardDescription>
                    All approved events happening soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {approvedEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium mb-2">
                          No approved events yet
                        </p>
                        <p className="text-sm">
                          Check back later for upcoming events
                        </p>
                      </div>
                    ) : (
                      approvedEvents.slice(0, 5).map((event) => (
                        <div
                          key={event.id}
                          className="p-4 border border-green-100 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {event.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {event.start_date?.slice(0, 10)} •{" "}
                                {event.venue_id}
                              </p>
                            </div>
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
          </>
        )}
      </div>
    </div>
  );
};
