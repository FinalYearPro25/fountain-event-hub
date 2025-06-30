
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, MapPin, Clock, Star, Plus, Search, Filter, BookOpen, Award, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventRegistrationModal } from './EventRegistrationModal';

export const StudentDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Mock data for events
  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      description: "Annual technology conference featuring industry leaders and startup showcases",
      date: "2024-02-15",
      time: "09:00 AM",
      venue: "Main Auditorium",
      type: "conference",
      status: "open",
      registered: false,
      capacity: 300,
      registered_count: 150,
      registration_fee: 500,
      organizer: "Dr. Sarah Johnson"
    },
    {
      id: 2,
      title: "Cultural Festival",
      description: "Celebrate diversity with music, dance, and food from around the world",
      date: "2024-02-20",
      time: "02:00 PM",
      venue: "Campus Ground",
      type: "cultural",
      status: "open",
      registered: true,
      capacity: 500,
      registered_count: 320,
      registration_fee: 0,
      organizer: "Student Affairs"
    },
    {
      id: 3,
      title: "Career Development Workshop",
      description: "Professional skills and career guidance session with industry experts",
      date: "2024-02-25",
      time: "10:00 AM",
      venue: "Business Hall",
      type: "workshop",
      status: "open",
      registered: false,
      capacity: 100,
      registered_count: 65,
      registration_fee: 200,
      organizer: "Career Services"
    },
    {
      id: 4,
      title: "AI and Machine Learning Seminar",
      description: "Introduction to artificial intelligence and its applications in modern technology",
      date: "2024-03-01",
      time: "11:00 AM",
      venue: "Engineering Hall A",
      type: "academic",
      status: "open",
      registered: false,
      capacity: 150,
      registered_count: 89,
      registration_fee: 300,
      organizer: "Prof. Michael Chen"
    }
  ]);

  const myRegistrations = upcomingEvents.filter(event => event.registered);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'full': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'cultural': return 'bg-purple-100 text-purple-800';
      case 'sports': return 'bg-orange-100 text-orange-800';
      case 'conference': return 'bg-indigo-100 text-indigo-800';
      case 'workshop': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = upcomingEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = () => {
    // Update the event in the local state
    setUpcomingEvents(prev => 
      prev.map(event => 
        event.id === selectedEvent?.id 
          ? { ...event, registered: true, registered_count: event.registered_count + 1 }
          : event
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events Registered</p>
                  <p className="text-2xl font-bold text-gray-900">{myRegistrations.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events Attended</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificates Earned</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Events</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Discover Events</CardTitle>
                <CardDescription>Find and register for upcoming campus events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Events List */}
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEventClick(event)}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                              <Badge className={getTypeColor(event.type)}>
                                {event.type}
                              </Badge>
                              <Badge className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {event.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {event.venue}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.registered_count}/{event.capacity}
                              </div>
                            </div>
                            {event.registration_fee > 0 && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  ₦{event.registration_fee.toLocaleString()}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {event.registered ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Registered
                              </Badge>
                            ) : (
                              <Button size="sm" onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}>
                                View Details
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Registrations */}
            <Card>
              <CardHeader>
                <CardTitle>My Registrations</CardTitle>
                <CardDescription>Events you're registered for</CardDescription>
              </CardHeader>
              <CardContent>
                {myRegistrations.length > 0 ? (
                  <div className="space-y-3">
                    {myRegistrations.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {event.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {event.venue}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No registrations yet</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Browse All Events
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  View Certificates
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {profile?.full_name}</div>
                  <div><span className="font-medium">Email:</span> {profile?.email}</div>
                  <div><span className="font-medium">Student ID:</span> {profile?.student_id}</div>
                  <div><span className="font-medium">College:</span> {profile?.college_id || 'Not specified'}</div>
                  <div><span className="font-medium">Year:</span> {profile?.year_of_study ? `Year ${profile.year_of_study}` : 'Not specified'}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <EventRegistrationModal
        event={selectedEvent}
        open={showRegistrationModal}
        onOpenChange={setShowRegistrationModal}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};
