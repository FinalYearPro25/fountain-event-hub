
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, Calendar, Users, BarChart3, 
  CheckCircle, XCircle, Eye, Clock, AlertTriangle,
  FileText, TrendingUp, Award
} from 'lucide-react';

export const DeanDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const collegeStats = {
    totalEvents: 45,
    pendingApprovals: 12,
    activeStudents: 1850,
    staffMembers: 85,
    monthlyBudget: 250000,
    utilizationRate: 78
  };

  const pendingApprovals = [
    {
      id: 1,
      title: "Engineering Innovation Expo",
      organizer: "Engineering Student Society",
      department: "Computer Science",
      requestedDate: "2024-02-20",
      budget: 15000,
      expectedAttendees: 200,
      priority: "high",
      submittedDate: "2024-01-15"
    },
    {
      id: 2,
      title: "Career Development Workshop",
      organizer: "Dr. Sarah Johnson",
      department: "Electrical Engineering",
      requestedDate: "2024-02-25",
      budget: 8000,
      expectedAttendees: 80,
      priority: "medium",
      submittedDate: "2024-01-18"
    }
  ];

  const collegeEvents = [
    {
      id: 1,
      title: "Tech Innovation Summit",
      department: "Computer Science",
      status: "approved",
      date: "2024-02-15",
      attendance: 150,
      capacity: 200,
      budget: 20000,
      rating: 4.7
    },
    {
      id: 2,
      title: "Engineering Fair",
      department: "Mechanical Engineering",
      status: "ongoing",
      date: "2024-02-10",
      attendance: 180,
      capacity: 250,
      budget: 35000,
      rating: 4.5
    }
  ];

  const departmentPerformance = [
    {
      department: "Computer Science",
      events: 12,
      attendance: 85,
      satisfaction: 4.6,
      budget_used: 75
    },
    {
      department: "Electrical Engineering",
      events: 8,
      attendance: 92,
      satisfaction: 4.4,
      budget_used: 68
    },
    {
      department: "Mechanical Engineering",
      events: 10,
      attendance: 78,
      satisfaction: 4.2,
      budget_used: 82
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
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
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dean Dashboard</h1>
                <p className="text-sm text-gray-500">College Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Dean
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
            <TabsTrigger value="approvals">Approvals</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">College Events</p>
                      <p className="text-2xl font-bold text-gray-900">{collegeStats.totalEvents}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                      <p className="text-2xl font-bold text-gray-900">{collegeStats.pendingApprovals}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Students</p>
                      <p className="text-2xl font-bold text-gray-900">{collegeStats.activeStudents.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                      <p className="text-2xl font-bold text-gray-900">{collegeStats.utilizationRate}%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Overview of department event activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentPerformance.map((dept, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{dept.department}</h4>
                          <Badge variant="secondary">{dept.events} events</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Attendance</p>
                            <p className="font-medium">{dept.attendance}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Satisfaction</p>
                            <p className="font-medium">{dept.satisfaction}/5.0</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Budget Used</p>
                            <p className="font-medium">{dept.budget_used}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent College Events</CardTitle>
                  <CardDescription>Latest events in your college</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {collegeEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-500">
                            {event.department} • {event.date}
                          </p>
                          <p className="text-sm text-gray-500">
                            {event.attendance}/{event.capacity} attendees
                          </p>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Event Approval Requests</CardTitle>
                    <CardDescription>Review and approve college event requests</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {pendingApprovals.length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <Card key={approval.id} className="border-l-4 border-l-blue-400">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{approval.title}</h3>
                              <Badge className={getPriorityColor(approval.priority)}>
                                {approval.priority} priority
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <span className="font-medium text-gray-600">Organizer:</span>
                                <p>{approval.organizer}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Department:</span>
                                <p>{approval.department}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Requested Date:</span>
                                <p>{approval.requestedDate}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Expected Attendees:</span>
                                <p>{approval.expectedAttendees}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>Budget: ₦{approval.budget.toLocaleString()}</span>
                              <span>Submitted: {approval.submittedDate}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>College Events</CardTitle>
                <CardDescription>Manage all events within your college</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {collegeEvents.map((event) => (
                    <Card key={event.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                              <Badge className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-500">
                              <div>
                                <span className="font-medium">Department:</span> {event.department}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {event.date}
                              </div>
                              <div>
                                <span className="font-medium">Attendance:</span> {event.attendance}/{event.capacity}
                              </div>
                              <div>
                                <span className="font-medium">Budget:</span> ₦{event.budget.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Rating:</span> {event.rating}/5.0
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>College Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators for your college</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Event Success Rate</p>
                        <p className="text-sm text-gray-500">Completed vs. cancelled events</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-600">94%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Average Attendance</p>
                        <p className="text-sm text-gray-500">Across all college events</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">78%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Satisfaction Score</p>
                        <p className="text-sm text-gray-500">Average event rating</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">4.4/5</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Budget Efficiency</p>
                        <p className="text-sm text-gray-500">Cost per attendee</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">₦125</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Event activity trends over the past months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">January 2024</span>
                      <div className="text-right">
                        <p className="font-bold">15 Events</p>
                        <p className="text-sm text-gray-500">1,240 Attendees</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">December 2023</span>
                      <div className="text-right">
                        <p className="font-bold">22 Events</p>
                        <p className="text-sm text-gray-500">1,800 Attendees</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">November 2023</span>
                      <div className="text-right">
                        <p className="font-bold">18 Events</p>
                        <p className="text-sm text-gray-500">1,450 Attendees</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
