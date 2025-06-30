
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, Calendar, Users, MapPin, Plus, 
  Eye, Edit, Clock, CheckCircle, AlertTriangle,
  BarChart3, FileText, Settings
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const staffStats = {
    eventsOrganized: 12,
    upcomingEvents: 4,
    totalAttendees: 850,
    pendingApprovals: 3,
    averageRating: 4.3,
    completionRate: 95
  };

  const myEvents = [
    {
      id: 1,
      title: "Web Development Workshop",
      description: "Hands-on workshop covering modern web technologies",
      date: "2024-02-20",
      time: "10:00 AM",
      venue: "Computer Lab A",
      status: "approved",
      attendees: 45,
      capacity: 50,
      registrations: 48
    },
    {
      id: 2,
      title: "Career Guidance Seminar",
      description: "Professional development and career planning session",
      date: "2024-02-25",
      time: "02:00 PM",
      venue: "Conference Room B",
      status: "pending_approval",
      attendees: 0,
      capacity: 80,
      registrations: 32
    },
    {
      id: 3,
      title: "Research Methodology Workshop",
      description: "Introduction to research methods and academic writing",
      date: "2024-03-05",
      time: "09:00 AM",
      venue: "Lecture Hall 1",
      status: "draft",
      attendees: 0,
      capacity: 100,
      registrations: 15
    }
  ];

  const upcomingEvents = myEvents.filter(event => 
    event.status === 'approved' && new Date(event.date) > new Date()
  );

  const pendingEvents = myEvents.filter(event => 
    event.status === 'pending_approval' || event.status === 'draft'
  );

  const resourceRequests = [
    {
      id: 1,
      eventTitle: "Web Development Workshop",
      resources: ["Projector", "Sound System", "Laptops"],
      status: "approved",
      totalCost: 5000,
      requestDate: "2024-01-15"
    },
    {
      id: 2,
      eventTitle: "Career Guidance Seminar",
      resources: ["Projector", "Microphones", "Refreshments"],
      status: "pending",
      totalCost: 8000,
      requestDate: "2024-01-18"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-sm text-gray-500">Event Management & Organization</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Events Organized</p>
                      <p className="text-2xl font-bold text-gray-900">{staffStats.eventsOrganized}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                      <p className="text-2xl font-bold text-gray-900">{staffStats.upcomingEvents}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                      <p className="text-2xl font-bold text-gray-900">{staffStats.totalAttendees}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{staffStats.averageRating}/5</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Your scheduled events requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {event.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.venue}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.registrations}/{event.capacity}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No upcoming events</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                  <CardDescription>Events and requests requiring your attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-500">
                            {event.status === 'draft' ? 'Complete and submit for approval' : 'Awaiting approval'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                          <Button size="sm" variant="outline">
                            {event.status === 'draft' ? 'Edit' : 'View'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {resourceRequests.filter(req => req.status === 'pending').map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg border-l-4 border-l-yellow-400">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Resource Request</h4>
                          <p className="text-sm text-gray-500">
                            {request.eventTitle} - ₦{request.totalCost.toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
                <p className="text-gray-600 mt-1">Manage all your organized events</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            </div>

            <div className="space-y-4">
              {myEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Date:</span> {event.date}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {event.time}
                          </div>
                          <div>
                            <span className="font-medium">Venue:</span> {event.venue}
                          </div>
                          <div>
                            <span className="font-medium">Registrations:</span> {event.registrations}/{event.capacity}
                          </div>
                          <div>
                            <span className="font-medium">Attendance:</span> {event.attendees}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Requests</CardTitle>
                <CardDescription>Manage resource requests for your events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resourceRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{request.eventTitle}</h3>
                              <Badge className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">Resources:</span>
                                <p>{request.resources.join(', ')}</p>
                              </div>
                              <div>
                                <span className="font-medium">Total Cost:</span>
                                <p>₦{request.totalCost.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="font-medium">Request Date:</span>
                                <p>{request.requestDate}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {request.status === 'pending' && (
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                Modify
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Event</CardTitle>
                <CardDescription>Organize a new campus event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Event Creation Form</h3>
                  <p className="text-gray-600 mb-6">
                    This feature will allow you to create comprehensive event proposals with
                    venue booking, resource requests, and approval workflows.
                  </p>
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Start Creating Event
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
