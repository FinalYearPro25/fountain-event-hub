
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
  [key: string]: any;
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
        .update({ status: "pending_student_affairs" as EventStatus })
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              HOD Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-3 py-1 border-emerald-200 text-emerald-700"
              >
                <UserCheck className="h-4 w-4" />
                You are logged in as: HOD
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 bg-green-100 text-green-800">
                {profile?.full_name}
              </Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={signOut}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            Sign Out
          </Button>
        </div>
        <Card className="border-emerald-100 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
            <CardTitle className="text-emerald-800">Pending Event Approvals</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-2 text-emerald-600">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">{error}</div>
            ) : pendingEvents.length === 0 ? (
              <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                No pending events.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{event.title}</div>
                      <div className="text-xs text-gray-500">
                        {event.start_date} • {event.venue_id}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
