
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Calendar, MapPin, Users, Clock, FileText, Download, Search, ArrowLeft, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type EventRecord = Database["public"]["Tables"]["events"]["Row"];

interface EventReportsProps {
  onBack: () => void;
}

interface VenueInfo {
  id: string;
  name: string;
  location_description?: string;
  capacity: number;
}

export const EventReports = ({ onBack }: EventReportsProps) => {
  const { user, profile } = useAuthContext();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [venues, setVenues] = useState<{ [key: string]: VenueInfo }>({});
  const [filteredEvents, setFilteredEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch events and venues in parallel
      const [eventsResult, venuesResult] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
        supabase
          .from('venues')
          .select('id, name, location_description, capacity')
          .eq('is_active', true)
      ]);

      if (eventsResult.error) {
        console.error('Error fetching events:', eventsResult.error);
        throw eventsResult.error;
      }

      if (venuesResult.error) {
        console.error('Error fetching venues:', venuesResult.error);
      }

      setEvents(eventsResult.data || []);
      setFilteredEvents(eventsResult.data || []);

      // Create venue lookup map
      if (venuesResult.data) {
        const venueMap = venuesResult.data.reduce((acc, venue) => {
          acc[venue.id] = venue;
          return acc;
        }, {} as { [key: string]: VenueInfo });
        setVenues(venueMap);
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user, profile]);

  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const exportToCSV = () => {
    const csvContent = [
      ['Title', 'Type', 'Date', 'Time', 'Venue', 'Location', 'Max Participants', 'Registration Fee', 'Description', 'Purpose'],
      ...filteredEvents.map(event => [
        event.title,
        event.event_type,
        new Date(event.start_date).toLocaleDateString(),
        new Date(event.start_date).toLocaleTimeString(),
        venues[event.venue_id]?.name || 'TBD',
        venues[event.venue_id]?.location_description || 'TBD',
        event.max_participants || '',
        event.registration_fee || '',
        event.description || '',
        event.description || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `approved_events_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Approved events report has been downloaded as CSV file.",
    });
  };

  if (selectedEvent) {
    const venue = venues[selectedEvent.venue_id];
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedEvent(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Event Details Report</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{selectedEvent.title}</CardTitle>
              <Badge className="bg-green-100 text-green-700 w-fit">Approved Event</Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Date & Time
                    </h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>Start:</strong> {new Date(selectedEvent.start_date).toLocaleString()}</p>
                      <p><strong>End:</strong> {new Date(selectedEvent.end_date).toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Venue & Location
                    </h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>Venue:</strong> {venue?.name || 'TBD'}</p>
                      {venue?.location_description && (
                        <p><strong>Location:</strong> {venue.location_description}</p>
                      )}
                      {venue?.capacity && (
                        <p><strong>Capacity:</strong> {venue.capacity} people</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Participants
                    </h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>Max Participants:</strong> {selectedEvent.max_participants || 'Unlimited'}</p>
                      {selectedEvent.registration_fee && (
                        <p><strong>Registration Fee:</strong> ${selectedEvent.registration_fee}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Event Details
                    </h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>Type:</strong> {selectedEvent.event_type}</p>
                      {selectedEvent.description && (
                        <div className="mt-2">
                          <strong>Description/Purpose:</strong>
                          <p className="mt-1 whitespace-pre-wrap">{selectedEvent.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Approval Information</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <p><strong>Status:</strong> Approved</p>
                      <p><strong>Created:</strong> {new Date(selectedEvent.created_at).toLocaleDateString()}</p>
                      {selectedEvent.approval_notes && (
                        <div className="mt-2">
                          <strong>Approval Notes:</strong>
                          <p className="mt-1">{selectedEvent.approval_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Approved Events Report
              </h1>
              <p className="text-gray-600 mt-1">
                Detailed reports of all approved events
              </p>
            </div>
          </div>
          <Button
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Search Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="search">Search by title, description, or type</Label>
              <Input
                id="search"
                placeholder="Search approved events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Approved</p>
                  <p className="text-2xl font-bold text-blue-700">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-green-700">
                    {events.filter(e => {
                      const eventDate = new Date(e.start_date);
                      const now = new Date();
                      return eventDate.getMonth() === now.getMonth() && 
                             eventDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {events.reduce((sum, event) => sum + (event.max_participants || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Approved Events Found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "Try adjusting your search to see more events."
                    : "No events have been approved yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => {
              const venue = venues[event.venue_id];
              return (
                <Card key={event.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                        {event.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      <Badge className="bg-green-100 text-green-700 ml-4">
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Date & Time</p>
                          <p className="text-sm text-gray-600">
                            {new Date(event.start_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.start_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-gray-600">{venue?.name || 'TBD'}</p>
                          {venue?.location_description && (
                            <p className="text-xs text-gray-500">{venue.location_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Capacity</p>
                          <p className="text-sm text-gray-600">
                            {event.max_participants ? `${event.max_participants} people` : 'Unlimited'}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{event.event_type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setSelectedEvent(event)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
