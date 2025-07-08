import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, FileText, Check, X, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type EventStatus = Database["public"]["Enums"]["event_status"];
type AppRole = Database["public"]["Enums"]["app_role"];

interface Event {
  id: string;
  title: string;
  start_date?: string;
  venue_id?: string;
  status?: EventStatus;
  organizer_id?: string;
  department?: string;
}

interface PendingRegistration {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  requested_role: string;
  status: string;
  created_at: string;
}

export const VCDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingRegistrations, setPendingRegistrations] = useState<
    PendingRegistration[]
  >([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    const fetchPending = async () => {
      try {
        // Only fetch events where approver_role is 'senate_member'
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("status", "pending_vc")
          .eq("approver_role", "senate_member");
        if (error) throw error;
        setPendingEvents(data || []);

        const { data: regData, error: regError } = await supabase
          .from("pending_registrations")
          .select("*")
          .eq("status", "pending");
        if (regError) throw regError;
        setPendingRegistrations(regData || []);
      } catch (err) {
        setError("Failed to load pending events or registrations.");
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
        .update({ status: "approved" as EventStatus })
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

  // Remove handleApproveRegistration and handleRejectRegistration for role approval
  // Only keep event approval/rejection logic

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Senate Member Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-3 py-1 border-green-200 text-green-800 bg-green-50"
              >
                <UserCheck className="h-4 w-4" />
                Senate Member
              </Badge>
              <Badge
                variant="secondary"
                className="px-3 py-1 bg-gray-100 text-gray-800"
              >
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

        {/* Only show pending events for approval, not registrations */}
        <Card className="mb-8 border-green-100 shadow-sm">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pending Events for Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {pendingEvents.length === 0 ? (
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
                      <div className="font-semibold text-gray-900">
                        {event.title}
                      </div>
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
