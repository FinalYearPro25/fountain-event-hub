
import { useState } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'student': 'STUDENT',
      'outsider': 'OUTSIDER/GUEST',
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
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <UserCheck className="h-4 w-4" />
                You are logged in as: {getRoleDisplayName(profile?.role || 'student')}
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

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setShowCreateEvent(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Event
                </Button>
                <Button variant="outline" onClick={() => setShowViewEvents(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View My Events
                </Button>
                <Button variant="outline" onClick={() => setShowViewVenues(true)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  View Available Venues
                </Button>
                <Button variant="outline" onClick={() => setShowBrowseEvents(true)}>
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
              <CardTitle className="text-sm font-medium">Registered Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">2 upcoming</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Events Created</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Events organized</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venues Booked</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
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
                <div className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-500">
                  <div>
                    <p className="font-medium">Study Group Session</p>
                    <p className="text-sm text-gray-600">Dec 25, 2024 • Library • Pending Approval</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border-l-4 border-green-500">
                  <div>
                    <p className="font-medium">Programming Workshop</p>
                    <p className="text-sm text-gray-600">Dec 20, 2024 • IT Lab • Approved</p>
                  </div>
                  <Badge variant="default">Approved</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 border-l-4 border-gray-400">
                  <div>
                    <p className="font-medium">Chess Tournament</p>
                    <p className="text-sm text-gray-600">Nov 28, 2024 • Game Room • Completed</p>
                  </div>
                  <Badge variant="secondary">Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Events</CardTitle>
              <CardDescription>Events you're registered for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Career Fair 2024</p>
                    <p className="text-sm text-gray-600">Dec 20, 2024 • Main Hall</p>
                  </div>
                  <Badge variant="default">Registered</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Tech Workshop</p>
                    <p className="text-sm text-gray-600">Dec 18, 2024 • IT Lab</p>
                  </div>
                  <Badge variant="secondary">Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Leadership Seminar</p>
                    <p className="text-sm text-gray-600">Jan 15, 2025 • Conference Room</p>
                  </div>
                  <Button size="sm">Register</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
