
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateEvent } from './CreateEvent';
import { 
  Shield, Users, Calendar, Settings, BarChart3, 
  CheckCircle, XCircle, Clock, Plus, Eye, Edit,
  UserPlus, Building, MapPin, AlertTriangle
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  // Mock data for demonstration
  const adminStats = {
    totalUsers: 2847,
    activeEvents: 23,
    pendingApprovals: 12,
    totalVenues: 15,
    monthlyRegistrations: 456,
    systemUptime: 99.8
  };

  const pendingApprovals = [
    {
      id: 1,
      title: "Tech Innovation Summit",
      organizer: "Dr. Sarah Johnson",
      date: "2024-02-15",
      type: "Conference",
      status: "pending_approval",
      priority: "high"
    },
    {
      id: 2,
      title: "Cultural Festival",
      organizer: "Student Affairs",
      date: "2024-02-20",
      type: "Cultural",
      status: "pending_approval",
      priority: "normal"
    }
  ];

  const recentActivities = [
    { action: "Event approved", details: "Leadership Workshop by Prof. Chen", time: "2 hours ago" },
    { action: "New user registered", details: "Student ID: 2024/CS/001", time: "4 hours ago" },
    { action: "Venue booking", details: "Amina Namadi Sambo Hall reserved", time: "6 hours ago" },
    { action: "Event cancelled", details: "Due to venue unavailability", time: "1 day ago" }
  ];

  const systemMetrics = [
    { label: "Total Events Created", value: 156, change: "+12%" },
    { label: "Active Registrations", value: 1234, change: "+8%" },
    { label: "Venue Utilization", value: "78%", change: "+5%" },
    { label: "User Satisfaction", value: "4.7/5", change: "+0.2" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (showCreateEvent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">System Administration & Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-red-100 text-red-800">
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
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">System Administration & Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-red-100 text-red-800">
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Events</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.activeEvents}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.pendingApprovals}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Uptime</p>
                      <p className="text-2xl font-bold text-gray-900">{adminStats.systemUptime}%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemMetrics.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{metric.label}</p>
                          <p className="text-sm text-gray-500">{metric.change} from last month</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.details}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
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
                <p className="text-gray-600 mt-1">Review and approve pending events</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  Sort
                </Button>
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
                          <AlertTriangle className={`h-4 w-4 ${getPriorityColor(approval.priority)}`} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Organizer:</span> {approval.organizer}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {approval.date}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {approval.type}
                          </div>
                          <div>
                            <span className="font-medium">Priority:</span> 
                            <span className={`ml-1 ${getPriorityColor(approval.priority)}`}>
                              {approval.priority}
                            </span>
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

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600 mt-1">Manage system users and their roles</p>
              </div>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management Interface</h3>
                  <p className="text-gray-600 mb-6">
                    Advanced user management features including role assignment, 
                    account status management, and user analytics.
                  </p>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure User Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
                <p className="text-gray-600 mt-1">Oversee all campus events</p>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Event Management System</h3>
                  <p className="text-gray-600 mb-6">
                    Comprehensive event management including scheduling, approval workflows, 
                    venue management, and participant tracking.
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

          <TabsContent value="venues" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Venue Management</h2>
                <p className="text-gray-600 mt-1">Manage campus venues and facilities</p>
              </div>
              <Button>
                <Building className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Venue Management System</h3>
                  <p className="text-gray-600 mb-6">
                    Manage all campus venues including capacity, availability, 
                    booking schedules, and facility maintenance.
                  </p>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Venues
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Event</CardTitle>
                <CardDescription>Create and manage campus events as an administrator</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create Administrative Event</h3>
                  <p className="text-gray-600 mb-6">
                    As an administrator, you can create events that bypass the normal approval process
                    and have immediate access to all system resources.
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
