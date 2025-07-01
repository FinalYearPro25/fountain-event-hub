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
  const [filter, setFilter] = useState({ type: "", capacity: "", college: "" });

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      const { data: venuesData } = await supabase
        .from("venues")
        .select("*")
        .eq("is_active", true);
      setVenues(venuesData || []);
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

  const filteredVenues = venues.filter(
    (v) =>
      (!filter.type || v.venue_type === filter.type) &&
      (!filter.capacity || v.capacity >= parseInt(filter.capacity)) &&
      (!filter.college || v.college_id === filter.college)
  );

  if (loading) return <div>Loading venues...</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        {/* Add filter controls here if needed */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVenues.map((venue) => {
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
