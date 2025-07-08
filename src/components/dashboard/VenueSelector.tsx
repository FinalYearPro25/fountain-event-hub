import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, XCircle, Lightbulb } from "lucide-react";

export const VenueSelector = ({
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSelectVenue,
  value,
  requiredCapacity = 0, // Add requiredCapacity prop
}) => {
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  const venueList = [
    {
      id: "ETI-OSA",
      name: "Eti-Osa Hall",
      venue_type: "hall",
      capacity: 300,
      location_description: "Main campus auditorium",
      images: [
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "PARENT-FORUM",
      name: "Parent Forum",
      venue_type: "conference_room",
      capacity: 150,
      location_description: "Conference and meeting hall",
      images: [
        "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "LR-HALL",
      name: "LR Hall",
      venue_type: "hall",
      capacity: 120,
      location_description: "Large lecture room",
      images: [
        "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "LT-HALL",
      name: "LT Hall",
      venue_type: "hall",
      capacity: 200,
      location_description: "Large lecture theatre",
      images: [
        "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "AMINA-SAMBO",
      name: "Amina Namadi Sambo Hall",
      venue_type: "hall",
      capacity: 500,
      location_description: "Main auditorium for large events",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "PG-BUILDING",
      name: "Post Graduate Building",
      venue_type: "conference_room",
      capacity: 80,
      location_description: "Conference rooms and seminar halls",
      images: [
        "https://images.unsplash.com/photo-1485833077593-4278bba3f11f?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "LAW-BUILDING",
      name: "College of Law Building",
      venue_type: "conference_room",
      capacity: 100,
      location_description: "Law faculty lecture halls",
      images: [
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "ART-BUILDING",
      name: "College of Art Building",
      venue_type: "conference_room",
      capacity: 150,
      location_description: "Arts and humanities facilities",
      images: [
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "MEDICAL-BUILDING",
      name: "College of Medical Building",
      venue_type: "conference_room",
      capacity: 90,
      location_description: "Medical school conference rooms",
      images: [
        "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "SHORELINE",
      name: "Shoreline Building",
      venue_type: "conference_room",
      capacity: 250,
      location_description: "Modern conference and event facility",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
  ];

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const { data: venuesData } = await supabase
          .from("venues")
          .select("*")
          .eq("is_active", true);
        if (!venuesData || venuesData.length === 0) {
          setVenues(venueList);
        } else {
          setVenues(venuesData);
        }
      } catch (error) {
        setVenues(venueList);
      } finally {
        setLoading(false);
      }
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

  // Find next available time for a venue
  const getNextAvailableTime = (venueId) => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return null;
    const end = new Date(`${selectedDate}T${selectedEndTime}`);
    // Find the latest end_time for this venue that overlaps or is before the requested time
    const bookingsForVenue = bookings
      .filter((b) => b.venue_id === venueId)
      .sort(
        (a, b) =>
          new Date(a.end_time).getTime() - new Date(b.end_time).getTime()
      );
    let nextAvailable = end;
    for (const b of bookingsForVenue) {
      if (new Date(b.end_time) > end) {
        nextAvailable = new Date(b.end_time);
        break;
      }
    }
    return nextAvailable;
  };

  // Suggest alternative venues that are available and have enough capacity
  const suggestedVenues = venues.filter(
    (venue) =>
      isVenueAvailable(venue.id) &&
      (!requiredCapacity || venue.capacity >= requiredCapacity)
  );

  if (loading) return <div>Loading venues...</div>;

  return (
    <div className="space-y-4">
      {suggestions.length > 0 && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Similar available venues:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((venue) => (
                  <Button
                    key={venue.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onSelectVenue(venue.id);
                      setSuggestions([]);
                    }}
                    className="text-xs"
                  >
                    {venue.name} (Cap: {venue.capacity})
                  </Button>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {venues.map((venue) => {
          const available = isVenueAvailable(venue.id);
          const isSelected = value === venue.id;
          const nextAvailable = !available
            ? getNextAvailableTime(venue.id)
            : null;
          return (
            <Card
              key={venue.id}
              className={isSelected ? "border-blue-500" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{venue.name}</CardTitle>
                  <Badge>{venue.venue_type.replace("_", " ")}</Badge>
                </div>
                <CardDescription>{venue.location_description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm mb-2">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {venue.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Campus</span>
                  </div>
                </div>
                {venue.images && venue.images.length > 0 && (
                  <img
                    src={venue.images[0]}
                    alt={venue.name}
                    className="rounded w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant={
                      available
                        ? isSelected
                          ? "default"
                          : "outline"
                        : "destructive"
                    }
                    disabled={!available}
                    onClick={(e) => {
                      e.preventDefault();
                      if (available) {
                        onSelectVenue(venue.id);
                        setSuggestions([]);
                      } else {
                        // The handleUnavailableVenueClick function was removed,
                        // so we'll just show the next available time if available.
                        // If not available, we'll show a message indicating it's not available.
                        if (nextAvailable) {
                          onSelectVenue(venue.id); // Select the venue at the next available time
                          setSuggestions([]);
                        } else {
                          // If no next available time, we can't select it.
                          // We could potentially show a message here or just do nothing.
                          // For now, we'll just show the message.
                        }
                      }
                    }}
                  >
                    {available ? (
                      isSelected ? (
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
                    <br />
                    {nextAvailable && (
                      <>
                        Next available after: {nextAvailable.toLocaleString()}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Venue suggestions */}
      {suggestedVenues.length > 0 && (
        <div className="mt-4">
          <div className="font-semibold text-green-700 mb-2">
            Suggested Available Venues:
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedVenues.map((venue) => (
              <span
                key={venue.id}
                className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs"
              >
                {venue.name} (Capacity: {venue.capacity})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
