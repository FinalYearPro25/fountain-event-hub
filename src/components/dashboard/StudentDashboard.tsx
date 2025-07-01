
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventRegistrationModal } from './EventRegistrationModal';
import { CreateEvent } from './CreateEvent';
import { supabase } from '@/integrations/supabase/client';
import { 
  GraduationCap, Calendar, Users, MapPin, Clock, 
  Star, Trophy, BookOpen, Plus, Eye, Search, Filter
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const studentStats = {
    eventsAttended: 15,
    upcomingEvents: 3,
    certificatesEarned: 8,
    totalPoints: 1250
  };

  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Innovation Summit 2024",
      description: "Join industry leaders discussing the future of technology and innovation in Nigeria.",
      date: "2024-02-15",
      time: "10:00 AM",
      venue: "Amina Namadi Sambo Hall",
      organizer: "Dr. Sarah Johnson",
      capacity: 500,
      registered: 342,
      fee: 2500,
      category: "Technology",
      image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop"
    },
    {
      id: 2,
      title: "Leadership Workshop",
      description: "Develop essential leadership skills for your professional journey.",
      date: "2024-02-20",
      time: "2:00 PM",
      venue: "College of Management Building",
      organizer: "Prof. Michael Chen",
      capacity: 100,
      registered: 78,
      fee: 0,
      category: "Professional Development",
      image: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop"
    },
    {
      id: 3,
      title: "Cultural Festival",
      description: "Celebrate diversity through music, dance, and traditional performances.",
      date: "2024-02-25",
      time: "6:00 PM",
      venue: "Eti-Osa Hall",
      organizer: "Cultural Affairs Office",
      capacity: 300,
      registered: 156,
      fee: 1000,
      category: "Cultural",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"
    }
  ];

  const myRegistrations = [
    {
      id: 1,
      title: "Career Development Seminar",
      date: "2024-01-15",
      status: "attended",
      certificate: true,
      rating: 4.5
    },
    {
      id: 2,
      title: "Research Methodology Workshop",
      date: "2024-01-20",
      status: "registered",
      certificate: false,
      rating: null
    }
  ];

  // Fetch user's created events
  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;
      
      try {
        const { data: events, error } = await supabase
          .from('events')
          .select('*')
          .eq('organizer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching events:', error);
        } else {
          setMyEvents(events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  const handleRegisterForEvent = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended': return 'bg-green-100 text-green-800';
      case 'registered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                  <p className="text-sm text-gray-500">Event Discovery & Participation</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
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
              setActiveTab('my-events');
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Event Discovery & Participation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {profile?.user_type?.toUpperCase()}
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
            <TabsTrigger value="events">Discover Events</TabsTrigger>
            <TabsTrigger value="registrations">My Events</TabsTrigger>
            <TabsTrigger value="my-events">Created Events</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Events Attended</p>
                      <p className="text-2xl font-bold text-gray-900">{studentStats.eventsAttended}</p>
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
                      <p className="text-2xl font-bold text-gray-900">{studentStats.upcomingEvents}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificates</p>
                      <p className="text-2xl font-bold text-gray-900">{studentStats.certificatesEarned}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Events Created</p>
                      <p className="text-2xl font-bold text-gray-900">{myEvents.length}</p>
                    </div>
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Events you might be interested in</CardDescription>
                </CardHeader>
                <CardContent>
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
                              {event.registered}/{event.capacity}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleRegisterForEvent(event)}>
                          Register
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Created Events</CardTitle>
                  <CardDescription>Events you have created</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myEvents.length > 0 ? (
                      myEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.start_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No events created yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Discover Events</h2>
                <p className="text-gray-600 mt-1">Find and register for campus events</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{event.category}</Badge>
                      <span className="text-sm font-medium text-green-600">
                        {event.fee === 0 ? 'Free' : `₦${event.fee.toLocaleString()}`}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.registered}/{event.capacity} registered</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleRegisterForEvent(event)}
                      >
                        Register Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
              <p className="text-gray-600 mt-1">Track your event registrations and attendance</p>
            </div>

            <div className="space-y-4">
              {myRegistrations.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{registration.title}</h3>
                          <Badge className={getStatusColor(registration.status)}>
                            {registration.status}
                          </Badge>
                          {registration.certificate && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                              Certificate Available
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {registration.date}
                          </div>
                          {registration.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {registration.rating}/5
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        {registration.certificate && (
                          <Button size="sm">
                            Download Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Created Events</h2>
                <p className="text-gray-600 mt-1">Events you have created and their status</p>
              </div>
              <Button onClick={() => setShowCreateEvent(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading your events...</div>
              ) : myEvents.length > 0 ? (
                myEvents.map((event) => (
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
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Start Date:</span> {new Date(event.start_date).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">End Date:</span> {new Date(event.end_date).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {event.event_type}
                            </div>
                            <div>
                              <span className="font-medium">Max Participants:</span> {event.max_participants || 'No limit'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {event.status === 'draft' && (
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Created Yet</h3>
                    <p className="text-gray-600 mb-4">
                      You haven't created any events yet. Start by creating your first event!
                    </p>
                    <Button onClick={() => setShowCreateEvent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Event</CardTitle>
                <CardDescription>Organize your own campus event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Create an Event?</h3>
                  <p className="text-gray-600 mb-6">
                    Students can also organize events! Create your own event and get it approved by the administration.
                  </p>
                  <Button size="lg" onClick={() => setShowCreateEvent(true)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Start Creating Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Event Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <EventRegistrationModal
          event={selectedEvent}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={() => {
            setShowRegistrationModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};
