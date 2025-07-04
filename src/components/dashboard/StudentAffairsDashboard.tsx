
import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, FileText, Check, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type EventStatus = Database["public"]["Enums"]["event_status"];

interface Event {
  id: string;
  title: string;
  start_date?: string;
  venue_id?: string;
  status?: EventStatus;
  organizer_id?: string;
  department?: string;
}

export const StudentAffairsDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    const fetchPending = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("status", "pending_student_affairs");
        if (error) throw error;
        setPendingEvents(data || []);
      } catch (err) {
        setError("Failed to load pending events.");
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [user]);

  const handleApprove = async (eventId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({ status: "pending_vc" as EventStatus })
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
        .update({ status: "rejected" as EventStatus })
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dean of Student Affairs Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-3 py-1 border-green-200 text-green-800 bg-green-50"
              >
                <UserCheck className="h-4 w-4" />
                Dean of Student Affairs
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-800">
                {profile?.full_name}
              </Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            Sign Out
          </Button>
        </div>
        
        <Card className="border-green-100 shadow-sm">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Event Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-green-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-8 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            ) : pendingEvents.length === 0 ? (
              <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                No pending events for approval.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-green-100 rounded-lg bg-white hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500">
                        {event.start_date} • {event.venue_id}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(event.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(event.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
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
