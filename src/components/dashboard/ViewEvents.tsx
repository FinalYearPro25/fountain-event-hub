
import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { UserHeader } from "@/components/common/UserHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ViewEventsProps {
  onBack: () => void;
}

export const ViewEvents = ({ onBack }: ViewEventsProps) => {
  const { user } = useAuthContext();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [
          { data: eventsData, error: eventsError },
          { data: venuesData, error: venuesError },
        ] = await Promise.all([
          supabase
            .from("events")
            .select("*")
            .eq("organizer_id", user.id)
            .order("created_at", { ascending: false }),
          supabase.from("venues").select("*").eq("is_active", true),
        ]);
        if (eventsError) {
          console.error("Error fetching events:", eventsError);
        } else {
          setEvents(eventsData || []);
        }
        if (venuesError) {
          console.error("Error fetching venues:", venuesError);
        } else {
          setVenues(venuesData || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, [user]);

  // Function to submit a draft event for approval
  const handleSubmitForApproval = async (eventId: string) => {
    setLoading(true);
    try {
      // Fetch the event to get its approver_role
      const { data: event, error: fetchError } = await supabase
        .from("events")
        .select("approver_role")
        .eq("id", eventId)
        .single();
      if (fetchError || !event || typeof event.approver_role !== "string") {
        console.error("Error fetching event for approval:", fetchError);
        setLoading(false);
        return;
      }
      type EventStatus =
        | "approved"
        | "rejected"
        | "draft"
        | "pending_approval"
        | "cancelled"
        | "completed"
        | "pending_student_affairs"
        | "pending_vc";
      let newStatus: EventStatus = "pending_approval";
      switch (event.approver_role) {
        case "student_affairs":
          newStatus = "pending_student_affairs";
          break;
        case "senate_member":
          newStatus = "pending_vc";
          break;
        // department_head and staff both use 'pending_approval'
        default:
          newStatus = "pending_approval";
      }
      const { error } = await supabase
        .from("events")
        .update({ status: newStatus })
        .eq("id", eventId);
      if (error) {
        console.error("Error submitting event for approval:", error);
      } else {
        // Refresh events list after submission
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", user.id)
          .order("created_at", { ascending: false });
        setEvents(eventsData || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "draft":
        return "Draft";
      case "pending_approval":
        return "Pending Initial Approval";
      case "pending_student_affairs":
        return "Pending Student Affairs";
      case "pending_vc":
        return "Pending VC Approval";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "completed":
        return "Completed";
      default:
        return status
          ? status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
          : "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending_approval":
      case "pending_student_affairs":
      case "pending_vc":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getVenue = (venue_id) => venues.find((v) => v.id === venue_id);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="My Events" 
        subtitle="View and manage your created events"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't created any events yet.
              </p>
              <Button onClick={onBack}>Create Your First Event</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const venue = getVenue(event.venue_id);
              return (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusLabel(event.status)}
                      </Badge>
                    </div>
                    <CardDescription>{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{venue ? venue.name : "Venue TBD"}</span>
                      </div>
                      {venue && venue.images && venue.images.length > 0 && (
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          <img
                            src={venue.images[0]}
                            alt={venue.name}
                            className="rounded w-24 h-16 object-cover border"
                            onError={(e) =>
                              ((e.target as HTMLImageElement).style.display =
                                "none")
                            }
                          />
                        </div>
                      )}
                      {event.max_participants && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            Max: {event.max_participants} participants
                          </span>
                        </div>
                      )}
                      {/* Show 'Submit for Approval' button if event is draft */}
                      {event.status === "draft" && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitForApproval(event.id)}
                            disabled={loading}
                          >
                            {loading ? "Submitting..." : "Submit for Approval"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
