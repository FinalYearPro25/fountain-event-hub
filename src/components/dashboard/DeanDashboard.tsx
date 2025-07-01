
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateEvent } from './CreateEvent';
import { 
  Building2, Users, Calendar, BarChart3, CheckCircle, 
  XCircle, Clock, Plus, Eye, TrendingUp, Award,
  BookOpen, GraduationCap, UserCheck, AlertTriangle
} from 'lucide-react';

export const DeanDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Mock data for demonstration
  const deanStats = {
    collegeStudents: 1247,
    facultyMembers: 87,
    collegeEvents: 18,
    pendingApprovals: 5,
    graduationRate: 92.5,
    researchGrants: 12
  };

  const pendingApprovals = [
    {
      id: 1,
      title: "Medical Research Symposium",
      organizer: "Dr. Smith",
      department: "Medicine",
      date: "2024-02-18",
      participants: 150,
      status: "pending_approval"
    },
    {
      id: 2,
      title: "Anatomy Workshop",
      organizer: "Prof. Johnson",
      department: "Basic Medical Sciences",
      date: "2024-02-22",
      participants: 80,
      status: "pending_approval"
    }
  ];

  const collegeMetrics = [
    { label: "Student Enrollment", value: 1247, change: "+5.2%", icon: Users },
    { label: "Faculty Members", value: 87, change: "+2.3%", icon: UserCheck },
    { label: "Active Programs", value: 12, change: "0%", icon: BookOpen },
    { label: "Graduation Rate", value: "92.5%", change: "+1.8%", icon: GraduationCap }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Dean's Welcome Address",
      date: "2024-02-10",
      time: "10:00 AM",
      venue: "College Auditorium",
      attendees: 300,
      status: "confirmed"
    },
    {
      id: 2,
      title: "Faculty Meeting",
      date: "2024-02-12",
      time: "2:00 PM",
      venue: "Conference Room A",
      attendees: 25,
      status: "confirmed"
    }
  ];

  const departmentPerformance = [
    { name: "Medicine", events: 8, participation: 85, satisfaction: 4.6 },
    { name: "Nursing", events: 5, participation: 92, satisfaction: 4.8 },
    { name: "Basic Medical Sciences", events: 3, participation: 78, satisfaction: 4.4 },
    { name: "Public Health", events: 2, participation: 88, satisfaction: 4.7 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showCreateEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dean Dashboard</h1>
                  <p className="text-sm text-gray-500">College Administration & Oversight</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {profile?.role?.replace('_', ' ').toUpperCase()}
                </Badge>
                <Button variant="outline" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CreateEvent 
            onBack={() => setShowCreateEvent(false)}
            onSuccess={() => {
              setShowCreateEvent(false);
              setActiveTab('events');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dean Dashboard</h1>
                <p className="text-sm text-gray-500">College Administration & Oversight</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {profile?.role?.replace('_', ' ').toUpperCase()}
              </Badge>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* College Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collegeMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <p className="text-xs text-green-600">{metric.change}</p>
                      </div>
                      <metric.icon className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming College Events</CardTitle>
                  <CardDescription>Events scheduled for this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{event.date} at {event.time}</span>
                            <span>{event.venue}</span>
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Event participation by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentPerformance.map((dept, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{dept.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{dept.events} events</span>
                            <span>{dept.participation}% participation</span>
                            <span>{dept.satisfaction}/5 rating</span>
                          </div>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Event Approvals</h2>
                <p className="text-gray-600 mt-1">Review events from your college</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                  {pendingApprovals.length} Pending
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <Card key={approval.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{approval.title}</h3>
                          <Badge className={getStatusColor(approval.status)}>
                            {approval.status.replace('_', ' ')}
                          </Badge>
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Organizer:</span> {approval.organizer}
                          </div>
                          <div>
                            <span className="font-medium">Department:</span> {approval.department}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {approval.date}
                          </div>
                          <div>
                            <span className="font-medium">Expected Participants:</span> {approval.participants}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" variant="outline" className="text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">College Events</h2>
                <p className="text-gray-600 mt-1">Manage events within your college</p>
              </div>
              <Button onClick={() => setShowCreateEvent(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">College Event Management</h3>
                  <p className="text-gray-600 mb-6">
                    Manage all events within your college including academic conferences, 
                    departmental meetings, student activities, and special occasions.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => setShowCreateEvent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">College Analytics</h2>
              <p className="text-gray-600 mt-1">Performance metrics and insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Participation Trends</CardTitle>
                  <CardDescription>Monthly participation rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">Analytics Chart Placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Engagement</CardTitle>
                  <CardDescription>Event engagement by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">Engagement Chart Placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create College Event</CardTitle>
                <CardDescription>Organize events for your college</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create New College Event</h3>
                  <p className="text-gray-600 mb-6">
                    As a Dean, you can create events for your college including academic conferences, 
                    departmental meetings, graduation ceremonies, and other college-specific activities.
                  </p>
                  <Button size="lg" onClick={() => setShowCreateEvent(true)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
