import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { CreateEvent } from "./CreateEvent";
import { ViewEvents } from "./ViewEvents";
import { ViewVenues } from "./ViewVenues";
import { BrowseEvents } from "./BrowseEvents";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { UserHeader } from "@/components/common/UserHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";

type EventStatus = Database["public"]["Enums"]["event_status"];

interface Event {
  id: string;
  title: string;
  start_date?: string;
  venue_id?: string;
  status?: EventStatus;
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
  const { user, profile } = useAuthContext();
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

  // Add state for modals
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      // Fetch events created by the staff
      const { data: created, error: createdErr } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", user.id);
      if (createdErr) throw createdErr;
      setMyEvents(created || []);

      // Fetch events assigned to this staff member for approval
      const { data: assignedEvents, error: assignedErr } = await supabase
        .from("events")
        .select("*")
        .eq("staff_assigned_to", user.id)
        .in("status", ["pending_approval", "pending_student_affairs", "pending_vc"]);
      if (assignedErr) throw assignedErr;
      setPendingApprovals(assignedEvents || []);

      // Stats
      setStats({
        myEvents: (created || []).length,
        registrations: 0,
        venues: (created || []).length,
        pending: (assignedEvents || []).length,
      });
    } catch (err) {
      setError("Failed to load dashboard data.");
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

  if (showCreateEvent) {
    return <CreateEvent onBack={() => setShowCreateEvent(false)} onSuccess={fetchData} />;
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <UserHeader 
        title="Staff Dashboard" 
        subtitle="Manage events and approvals"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="ml-3 text-emerald-600">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">{error}</div>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="mb-8">
              <Card className="border-emerald-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="text-emerald-800">Quick Actions</CardTitle>
                  <CardDescription className="text-emerald-600">
                    Get started with common tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={() => setShowCreateEvent(true)}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Event
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowViewEvents(true)}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View My Events
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowViewVenues(true)}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Check Venue Availability
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBrowseEvents(true)}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse All Events
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReports(true)}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(true)}
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Event Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-800">
                    My Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">{stats.myEvents}</div>
                  <p className="text-xs text-emerald-600">
                    Events organized
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-800">
                    Total Registrations
                  </CardTitle>
                  <Users className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">
                    {stats.registrations}
                  </div>
                  <p className="text-xs text-emerald-600">
                    Across all events
                  </p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-800">
                    Venues Booked
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">{stats.venues}</div>
                  <p className="text-xs text-emerald-600">This month</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-800">
                    Pending Approvals
                  </CardTitle>
                  <FileText className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">{stats.pending}</div>
                  <p className="text-xs text-emerald-600">
                    Awaiting review
                  </p>
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
              <Card className="border-emerald-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="text-emerald-800">My Events & Status</CardTitle>
                  <CardDescription className="text-emerald-600">
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
                          className="flex items-center justify-between p-3 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-600">
                              {event.start_date?.slice(0, 10)} •{" "}
                              {event.venue_id} • {event.status}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="border-emerald-200 text-emerald-700"
                          >
                            {event.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-100 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
                  <CardTitle className="text-emerald-800">Recent Activity</CardTitle>
                  <CardDescription className="text-emerald-600">
                    Latest updates and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-gray-500 bg-gray-50 p-4 rounded-lg text-center">
                      No recent activity.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      
      <Dialog open={showReports} onOpenChange={setShowReports}>
        <DialogContent className="border-emerald-100">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">Reports</DialogTitle>
          </DialogHeader>
          <div className="text-gray-700">
            Reports feature coming soon! Here you will be able to generate and
            download event reports.
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="border-emerald-100">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">Event Settings</DialogTitle>
          </DialogHeader>
          <div className="text-gray-700">
            Event settings feature coming soon! Here you will be able to
            configure event-related preferences.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
