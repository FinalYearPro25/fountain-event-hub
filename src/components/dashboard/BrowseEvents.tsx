
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BrowseEventsProps {
  onBack: () => void;
}

export const BrowseEvents = ({ onBack }: BrowseEventsProps) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'approved')
          .order('start_date', { ascending: true });

        if (error) {
          console.error('Error fetching events:', error);
        } else {
          setEvents(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-700';
      case 'cultural': return 'bg-purple-100 text-purple-700';
      case 'sports': return 'bg-green-100 text-green-700';
      case 'conference': return 'bg-orange-100 text-orange-700';
      case 'workshop': return 'bg-yellow-100 text-yellow-700';
      case 'seminar': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Browse All Events</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
              <p className="text-gray-600">There are currently no approved events to browse.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge className={getEventTypeColor(event.event_type)}>
                      {event.event_type}
                    </Badge>
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue_id || 'Venue TBD'}</span>
                    </div>
                    {event.max_participants && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Max: {event.max_participants} participants</span>
                      </div>
                    )}
                    {event.registration_fee && event.registration_fee > 0 && (
                      <div className="text-sm font-medium">
                        Fee: ₦{event.registration_fee}
                      </div>
                    )}
                  </div>
                  <Button className="w-full">Register for Event</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
