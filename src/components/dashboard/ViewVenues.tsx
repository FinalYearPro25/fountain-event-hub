import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ViewVenuesProps {
  onBack: () => void;
}

export const ViewVenues = ({ onBack }: ViewVenuesProps) => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Updated venue names as requested
  const mockVenues = [
    {
      id: "eti-osa-hall",
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
      id: "parent-forum",
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
      id: "lr-hall",
      name: "LR Hall",
      venue_type: "classroom",
      capacity: 120,
      location_description: "Large lecture room",
      images: [
        "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "lt-hall",
      name: "LT Hall",
      venue_type: "classroom",
      capacity: 200,
      location_description: "Large lecture theatre",
      images: [
        "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "amina-namadi-sambo-hall",
      name: "Amina Namadi Sambo Hall",
      venue_type: "auditorium",
      capacity: 500,
      location_description: "Main auditorium for large events",
      images: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "post-graduate-building",
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
      id: "college-law-building",
      name: "College of Law Building",
      venue_type: "classroom",
      capacity: 100,
      location_description: "Law faculty lecture halls",
      images: [
        "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "college-art-building",
      name: "College of Art Building",
      venue_type: "hall",
      capacity: 150,
      location_description: "Arts and humanities facilities",
      images: [
        "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop&crop=center",
      ],
      is_active: true,
    },
    {
      id: "college-medical-building",
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
      id: "shoreline-building",
      name: "Shoreline Building",
      venue_type: "hall",
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
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Available Venues</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Card key={venue.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{venue.name}</CardTitle>
                    <Badge>{venue.venue_type}</Badge>
                  </div>
                  <CardDescription>
                    {venue.location_description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
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
                          console.log("Image failed to load:", venue.images[0]);
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
