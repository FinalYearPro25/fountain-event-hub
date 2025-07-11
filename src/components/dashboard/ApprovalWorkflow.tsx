import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Check, X, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type EventStatus = Database["public"]["Enums"]["event_status"];

interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  organizer_id: string;
  venue_id?: string;
  event_type: string;
  max_participants?: number;
  staff_assigned_to?: string;
}

interface ApprovalWorkflowProps {
  events: Event[];
  onEventUpdated: () => void;
}

export const ApprovalWorkflow = ({
  events,
  onEventUpdated,
}: ApprovalWorkflowProps) => {
  const { profile } = useAuthContext();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [venues, setVenues] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  // Fetch venue names when component mounts
  React.useEffect(() => {
    const fetchVenues = async () => {
      const uniqueVenueIds = [
        ...new Set(events.map((e) => e.venue_id).filter(Boolean)),
      ];
      if (uniqueVenueIds.length === 0) return;

      const { data: venuesData } = await supabase
        .from("venues")
        .select("id, name")
        .in("id", uniqueVenueIds);

      if (venuesData) {
        const venueMap = venuesData.reduce(
          (acc, venue) => {
            acc[venue.id] = venue.name;
            return acc;
          },
          {} as { [key: string]: string }
        );
        setVenues(venueMap);
      }
    };

    fetchVenues();
  }, [events]);

  const getNextStatus = (
    currentStatus: string,
    userRole: string
  ): EventStatus => {
    const approvalFlow = {
      pending_approval: {
        staff: "pending_student_affairs" as EventStatus,
        event_coordinator: "pending_student_affairs" as EventStatus,
        department_head: "pending_student_affairs" as EventStatus,
      },
      pending_student_affairs: {
        dean_student_affairs: "pending_vc" as EventStatus,
      },
      pending_vc: {
        senate_member: "approved" as EventStatus,
      },
    } as const;

    return (
      approvalFlow[currentStatus as keyof typeof approvalFlow]?.[
        userRole as keyof (typeof approvalFlow)[keyof typeof approvalFlow]
      ] || "approved"
    );
  };

  const canApprove = (event: Event) => {
    const userRole = profile?.role;

    switch (event.status) {
      case "pending_approval":
        return ["staff", "event_coordinator", "department_head"].includes(
          userRole || ""
        );
      case "pending_student_affairs":
        return userRole === "dean_student_affairs";
      case "pending_vc":
        return userRole === "senate_member";
      default:
        return false;
    }
  };

  const createNotification = async (userId: string, message: string) => {
    try {
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        message: message,
      });

      if (error) {
        console.error("Failed to create notification:", error);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const handleApproval = async (eventId: string, approve: boolean) => {
    setActionLoading(eventId);

    try {
      const event = events.find((e) => e.id === eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      const newStatus: EventStatus = approve
        ? getNextStatus(event.status, profile?.role || "")
        : "rejected";

      console.log("Approving event:", eventId);
      console.log("Current status:", event.status);
      console.log("New status:", newStatus);
      console.log("User role:", profile?.role);

      // Simple update with minimal data
      const updateData: any = {
        status: newStatus,
      };

      // Only add optional fields if they exist
      if (comments[eventId]?.trim()) {
        updateData.approval_notes = comments[eventId].trim();
      }

      if (profile?.role) {
        updateData.approver_role = profile.role;
      }

      console.log("Sending update:", updateData);

      const { data, error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", eventId)
        .select("*")
        .single();

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Failed to update event: ${error.message}`);
      }

      console.log("Update successful:", data);

      // Create notification for the event organizer
      const notificationMessage = approve
        ? `Your event "${event.title}" has been ${newStatus === "approved" ? "approved" : "moved to the next approval stage"}.`
        : `Your event "${event.title}" has been rejected.${comments[eventId] ? " Reason: " + comments[eventId] : ""}`;
      
      await createNotification(event.organizer_id, notificationMessage);

      // Clear comment
      setComments((prev) => ({ ...prev, [eventId]: "" }));

      // Show success toast
      toast({
        title: approve ? "Event Approved" : "Event Rejected",
        description: `The event "${event.title}" has been ${approve ? "approved" : "rejected"}.`,
      });

      // Refresh parent dashboard
      onEventUpdated();
    } catch (error) {
      console.error("Error in handleApproval:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update event status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700";
      case "pending_student_affairs":
        return "bg-blue-100 text-blue-700";
      case "pending_vc":
        return "bg-purple-100 text-purple-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "Pending Initial Approval";
      case "pending_student_affairs":
        return "Pending Student Affairs";
      case "pending_vc":
        return "Pending VC Approval";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const eventsToApprove = events.filter((event) => canApprove(event));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Events Pending Your Approval</h3>
        <Badge variant="outline">{eventsToApprove.length}</Badge>
      </div>

      {eventsToApprove.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No events pending your approval</p>
          </CardContent>
        </Card>
      ) : (
        eventsToApprove.map((event) => (
          <Card key={event.id} className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <Badge className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
              {event.description && (
                <p className="text-sm text-gray-600">{event.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(event.start_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {event.event_type}
                </div>
                {event.max_participants && (
                  <div>
                    <span className="font-medium">Max Participants:</span>{" "}
                    {event.max_participants}
                  </div>
                )}
                {event.venue_id && (
                  <div>
                    <span className="font-medium">Venue:</span>{" "}
                    {venues[event.venue_id] || "Loading..."}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Textarea
                  placeholder="Add comments (optional)"
                  value={comments[event.id] || ""}
                  onChange={(e) =>
                    setComments((prev) => ({
                      ...prev,
                      [event.id]: e.target.value,
                    }))
                  }
                  className="resize-none"
                  rows={2}
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproval(event.id, true)}
                    disabled={actionLoading === event.id}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" />
                    {actionLoading === event.id ? "Processing..." : "Approve"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleApproval(event.id, false)}
                    disabled={actionLoading === event.id}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    {actionLoading === event.id ? "Processing..." : "Reject"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
