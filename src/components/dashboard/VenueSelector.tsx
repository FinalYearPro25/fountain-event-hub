
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, XCircle } from "lucide-react";

export const VenueSelector = ({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSelectVenue,
  value,
}) => {
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Updated venues data with your specified locations
  const mockVenues = [
    {
      id: "eti-osa-hall",
      name: "Eti-Osa Hall",
      venue_type: "hall",
      capacity: 300,
      location_description: "Main campus auditorium",
      college_id: "general",
      images: ["https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "parent-forum",
      name: "Parent Forum",
      venue_type: "conference_room",
      capacity: 150,
      location_description: "Conference and meeting hall",
      college_id: "general",
      images: ["https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "lr-hall",
      name: "LR Hall",
      venue_type: "classroom",
      capacity: 120,
      location_description: "Large lecture room",
      college_id: "general",
      images: ["https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "lt-hall",
      name: "LT Hall",
      venue_type: "classroom",
      capacity: 200,
      location_description: "Large lecture theatre",
      college_id: "general",
      images: ["https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "amina-namadi-sambo-hall",
      name: "Amina Namadi Sambo Hall",
      venue_type: "auditorium",
      capacity: 500,
      location_description: "Main auditorium for large events",
      college_id: "general",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "postgraduate-building",
      name: "Post Graduate Building",
      venue_type: "conference_room",
      capacity: 80,
      location_description: "Conference rooms and seminar halls",
      college_id: "general",
      images: ["https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "college-law-building",
      name: "College of Law Building",
      venue_type: "classroom",
      capacity: 100,
      location_description: "Law faculty lecture halls",
      college_id: "law",
      images: ["https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "college-art-building",
      name: "College of Art Building",
      venue_type: "hall",
      capacity: 150,
      location_description: "Arts and humanities facilities",
      college_id: "arts",
      images: ["https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "college-medical-building",
      name: "College of Medical Building",
      venue_type: "conference_room",
      capacity: 90,
      location_description: "Medical school conference rooms",
      college_id: "medical",
      images: ["https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop"],
      is_active: true
    },
    {
      id: "shoreline-building",
      name: "Shoreline Building",
      venue_type: "hall",
      capacity: 250,
      location_description: "Modern conference and event facility",
      college_id: "general",
      images: ["https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop"],
      is_active: true
    }
  ];

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      try {
        const { data: venuesData } = await supabase
          .from("venues")
          .select("*")
          .eq("is_active", true);
        
        // If no venues in database, use mock data
        if (!venuesData || venuesData.length === 0) {
          setVenues(mockVenues);
        } else {
          setVenues(venuesData);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        // Fallback to mock data
        setVenues(mockVenues);
      }
      setLoading(false);
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return;
    const fetchBookings = async () => {
      const start = new Date(`${selectedDate}T${selectedStartTime}`);
      const end = new Date(`${selectedDate}T${selectedEndTime}`);
      const { data: bookingsData } = await supabase
        .from("venue_bookings")
        .select("venue_id, start_time, end_time, status")
        .in("status", ["active", "completed"])
        .gte("end_time", start.toISOString())
        .lte("start_time", end.toISOString());
      setBookings(bookingsData || []);
    };
    fetchBookings();
  }, [selectedDate, selectedStartTime, selectedEndTime]);

  const isVenueAvailable = (venueId) => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return true;
    const start = new Date(`${selectedDate}T${selectedStartTime}`);
    const end = new Date(`${selectedDate}T${selectedEndTime}`);
    return !bookings.some(
      (b) =>
        b.venue_id === venueId &&
        new Date(b.start_time) < end &&
        new Date(b.end_time) > start
    );
  };

  if (loading) return <div>Loading venues...</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {venues.map((venue) => {
          const available = isVenueAvailable(venue.id);
          return (
            <Card
              key={venue.id}
              className={value === venue.id ? "border-blue-500" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{venue.name}</CardTitle>
                  <Badge>{venue.venue_type}</Badge>
                </div>
                <CardDescription>{venue.location_description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm mb-2">
                  <Users className="h-4 w-4" /> Capacity: {venue.capacity}
                  <MapPin className="h-4 w-4" /> {venue.college_id}
                </div>
                {venue.images && venue.images.length > 0 && (
                  <img
                    src={venue.images[0]}
                    alt="Venue"
                    className="rounded w-full max-h-32 object-cover mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={
                      available
                        ? value === venue.id
                          ? "default"
                          : "outline"
                        : "destructive"
                    }
                    disabled={!available}
                    onClick={() => available && onSelectVenue(venue.id)}
                  >
                    {available ? (
                      value === venue.id ? (
                        "Selected"
                      ) : (
                        "Select"
                      )
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" /> Unavailable
                      </>
                    )}
                  </Button>
                </div>
                {!available && (
                  <div className="text-xs text-red-600 mt-1">
                    This venue is not available for the selected time.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
