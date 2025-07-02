
import { useState } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { CreateEvent } from "./CreateEvent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, FileText, UserCheck, Plus } from "lucide-react";

export const StaffDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'staff': 'STAFF',
      'event_coordinator': 'EVENT COORDINATOR',
    };
    return roleMap[role] || role.toUpperCase();
  };

  if (showCreateEvent) {
    return <CreateEvent onBack={() => setShowCreateEvent(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Role Confirmation */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <UserCheck className="h-4 w-4" />
                You are logged in as: {getRoleDisplayName(profile?.role || 'staff')}
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
                <Button variant="outline">View My Events</Button>
                <Button variant="outline">Check Venue Availability</Button>
                <Button variant="outline">View Reports</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 upcoming</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">Total participants</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venues Booked</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Your latest event activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Academic Conference 2024</p>
                    <p className="text-sm text-gray-600">Dec 15, 2024 • Main Auditorium</p>
                  </div>
                  <Badge variant="secondary">Approved</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Workshop on AI</p>
                    <p className="text-sm text-gray-600">Dec 10, 2024 • Lab 201</p>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Student Orientation</p>
                    <p className="text-sm text-gray-600">Nov 28, 2024 • Great Hall</p>
                  </div>
                  <Badge variant="default">Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Important dates to remember</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-red-50">
                  <div>
                    <p className="font-medium">Event Report Due</p>
                    <p className="text-sm text-gray-600">Academic Conference 2024</p>
                  </div>
                  <span className="text-sm text-red-600">2 days</span>
                </div>
                <div className="flex items-center justify-between p-3 border-l-4 border-yellow-500 bg-yellow-50">
                  <div>
                    <p className="font-medium">Venue Confirmation</p>
                    <p className="text-sm text-gray-600">Workshop on AI</p>
                  </div>
                  <span className="text-sm text-yellow-600">5 days</span>
                </div>
                <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50">
                  <div>
                    <p className="font-medium">Budget Approval</p>
                    <p className="text-sm text-gray-600">New Year Celebration</p>
                  </div>
                  <span className="text-sm text-green-600">1 week</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
