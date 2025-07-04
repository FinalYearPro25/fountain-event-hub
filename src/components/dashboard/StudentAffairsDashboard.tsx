// Type definitions for Student Affairs Dashboard
interface Event {
  id: string;
  title: string;
  start_date?: string;
  venue_id?: string;
  status?:
    | "approved"
    | "rejected"
    | "draft"
    | "pending_approval"
    | "cancelled"
    | "completed"
    | "pending_student_affairs"
    | "pending_vc";
  organizer_id?: string;
  department?: string;
  [key: string]: any;
}

import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, FileText, Check, X } from "lucide-react";

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
        .update({ status: "pending_vc" as any })
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dean of Student Affairs Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-3 py-1"
              >
                <UserCheck className="h-4 w-4" />
                You are logged in as: Dean of Student Affairs
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                {profile?.full_name}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pending Event Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : pendingEvents.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No pending events.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-xs text-gray-500">
                        {event.start_date} • {event.venue_id}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
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
