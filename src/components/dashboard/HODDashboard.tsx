import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { UserHeader } from "@/components/common/UserHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  UserCheck,
  FileText,
  Check,
  X,
  Building2,
  Calendar,
  Search,
  Bell,
  Settings,
} from "lucide-react";

interface SimplePendingEvent {
  id: string;
  title: string;
  start_date: string | null;
  venue_id: string | null;
  organizer_id: string | null;
  status: string;
  description?: string;
  end_date: string;
  event_type: string;
  max_participants?: number;
}

export const HODDashboard = () => {
  const { user, profile } = useAuthContext();
  const [pendingEvents, setPendingEvents] = useState<SimplePendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPendingEvents = async () => {
    if (!user || !profile?.department) return;
    setLoading(true);
    setError("");
    try {
      // Only fetch events where approver_role is 'department_head'
      const { data, error: fetchError } = await supabase
        .from("events")
        .select(
          "id, title, start_date, venue_id, organizer_id, status, approver_role"
        )
        .eq("status", "pending_approval")
        .eq("approver_role", "department_head");
      if (fetchError) throw fetchError;
      if (data) {
        const eventsWithDepartmentCheck = [];
        for (const event of data) {
          const { data: organizerProfile } = await supabase
            .from("profiles")
            .select("department")
            .eq("id", event.organizer_id)
            .single();
          if (organizerProfile?.department === profile.department) {
            eventsWithDepartmentCheck.push(event);
          }
        }
        setPendingEvents(eventsWithDepartmentCheck);
      }
    } catch (err) {
      console.error("Error fetching pending events:", err);
      setError("Failed to load pending events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, [user, profile]);

  const handleApprove = async (eventId: string) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("events")
        .update({ status: "pending_student_affairs" })
        .eq("id", eventId);
      if (updateError) throw updateError;
      setPendingEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error("Error approving event:", err);
      setError("Failed to approve event.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (eventId: string) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("events")
        .update({ status: "rejected" })
        .eq("id", eventId);
      if (updateError) throw updateError;
      setPendingEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error("Error rejecting event:", err);
      setError("Failed to reject event.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = pendingEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader
        title="HOD Dashboard"
        subtitle={`Department of ${profile?.department || "Unknown"}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Events
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingEvents.length}</div>
              <p className="text-xs text-muted-foreground">Require approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{profile?.department}</div>
              <p className="text-xs text-muted-foreground">Your department</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Head of Department</div>
              <p className="text-xs text-muted-foreground">Your role</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Event Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="ml-3">Loading events...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="font-medium mb-1">Error Loading Events</div>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Pending Events
                </h3>
                <p className="text-gray-600">
                  All departmental events have been reviewed.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {event.start_date
                          ? new Date(event.start_date).toLocaleDateString()
                          : "Date TBD"}
                      </p>
                      <Badge variant="secondary">Pending Review</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(event.id)}
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(event.id)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-1" />
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
