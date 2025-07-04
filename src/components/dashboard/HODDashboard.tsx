
import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, FileText, Check, X, Building2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  start_date?: string;
  venue_id?: string;
  status?: string;
  organizer_id?: string;
  department?: string;
}

export const HODDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !profile?.department) return;
    setLoading(true);
    setError("");
    const fetchPending = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("status", "pending_approval")
          .eq("department", profile.department);
        if (error) throw error;
        setPendingEvents(data || []);
      } catch (err) {
        setError("Failed to load pending events.");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [user, profile]);

  const handleApprove = async (eventId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: "pending_student_affairs" })
        .eq("id", eventId);
      if (error) throw error;
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      setError("Failed to approve event.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (eventId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: "rejected" })
        .eq("id", eventId);
      if (error) throw error;
      setPendingEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      setError("Failed to reject event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Building2 className="h-8 w-8 text-green-700" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Department Head Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage departmental event approvals and oversight
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="border-green-200 text-green-700 hover:bg-green-50 px-6 py-2"
            >
              Sign Out
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge
              variant="outline"
              className="flex items-center gap-2 px-4 py-2 border-green-200 text-green-800 bg-green-50 text-sm font-medium"
            >
              <UserCheck className="h-4 w-4" />
              Head of Department
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 bg-gray-100 text-gray-800 text-sm">
              {profile?.department}
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 bg-gray-100 text-gray-800 text-sm">
              {profile?.full_name}
            </Badge>
          </div>
        </div>
        
        {/* Pending Events Card */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <FileText className="h-6 w-6" />
              Pending Event Approvals
              {pendingEvents.length > 0 && (
                <Badge className="bg-white/20 text-white border-white/30">
                  {pendingEvents.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-green-600 font-medium">Loading events...</p>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-12 bg-red-50 rounded-xl border border-red-200">
                <div className="text-lg font-medium mb-2">Error Loading Events</div>
                <p>{error}</p>
              </div>
            ) : pendingEvents.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-gray-500 text-lg font-medium mb-2">No Pending Events</div>
                <p className="text-gray-400">All departmental events have been reviewed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-6 border border-green-100 rounded-xl bg-gradient-to-r from-white to-green-50/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg mb-2">{event.title}</div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>Date: {event.start_date ? new Date(event.start_date).toLocaleDateString() : 'TBD'}</div>
                        <div>Venue: {event.venue_id || 'TBD'}</div>
                        <div>Department: {event.department || profile?.department}</div>
                      </div>
                    </div>
                    <div className="flex gap-3 ml-6">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium"
                        onClick={() => handleApprove(event.id)}
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 mr-2" /> 
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="px-4 py-2 font-medium"
                        onClick={() => handleReject(event.id)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-2" /> 
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
