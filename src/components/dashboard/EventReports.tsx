
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Calendar, MapPin, Users, Clock, FileText, Download, Search, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type EventRecord = Database["public"]["Tables"]["events"]["Row"];

interface EventReportsProps {
  onBack: () => void;
}

export const EventReports = ({ onBack }: EventReportsProps) => {
  const { user, profile } = useAuthContext();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      // Staff can see events they organized or are assigned to approve
      if (profile?.role === 'staff' || profile?.role === 'event_coordinator') {
        query = query.or(`organizer_id.eq.${user.id},staff_assigned_to.eq.${user.id}`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      setEvents(data || []);
      setFilteredEvents(data || []);
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

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pending_student_affairs':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending_vc':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending Initial Approval';
      case 'pending_student_affairs':
        return 'Pending Student Affairs';
      case 'pending_vc':
        return 'Pending VC Approval';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Title', 'Type', 'Status', 'Start Date', 'End Date', 'Venue', 'Max Participants', 'Registration Fee', 'Description'],
      ...filteredEvents.map(event => [
        event.title,
        event.event_type,
        event.status || '',
        new Date(event.start_date).toLocaleDateString(),
        new Date(event.end_date).toLocaleDateString(),
        event.venue_id || '',
        event.max_participants || '',
        event.registration_fee || '',
        event.description || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `events_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Events report has been downloaded as CSV file.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="ml-3 text-emerald-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                Event Reports
              </h1>
              <p className="text-emerald-600 mt-1">
                Comprehensive overview of all events and their details
              </p>
            </div>
          </div>
          <Button
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Search Events</Label>
                <Input
                  id="search"
                  placeholder="Search by title, description, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <Label htmlFor="status">Filter by Status</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending_approval">Pending Initial Approval</option>
                  <option value="pending_student_affairs">Pending Student Affairs</option>
                  <option value="pending_vc">Pending VC Approval</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-emerald-700">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-700">
                    {events.filter(e => e.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {events.filter(e => e.status?.includes('pending')).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-700">
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
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <Card className="border-emerald-100">
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Events Found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your filters to see more events."
                    : "No events have been created yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} className="border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-emerald-800 text-xl mb-2">{event.title}</CardTitle>
                      {event.description && (
                        <p className="text-gray-600 mb-3">{event.description}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(event.status || '')}>
                      {getStatusLabel(event.status || '')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.start_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium">End Date</p>
                        <p className="text-sm text-gray-600">
                          {new Date(event.end_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-sm font-medium">Event Type</p>
                        <p className="text-sm text-gray-600 capitalize">{event.event_type}</p>
                      </div>
                    </div>
                    {event.venue_id && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">Venue</p>
                          <p className="text-sm text-gray-600">{event.venue_id}</p>
                        </div>
                      </div>
                    )}
                    {event.max_participants && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">Max Participants</p>
                          <p className="text-sm text-gray-600">{event.max_participants}</p>
                        </div>
                      </div>
                    )}
                    {event.registration_fee && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium">Registration Fee</p>
                          <p className="text-sm text-gray-600">${event.registration_fee}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {event.approval_notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700">Approval Notes:</p>
                      <p className="text-sm text-gray-600 mt-1">{event.approval_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
