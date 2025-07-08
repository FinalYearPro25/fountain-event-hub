
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Check, X, Clock, FileText } from "lucide-react";

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
}

interface ApprovalWorkflowProps {
  events: Event[];
  onEventUpdated: () => void;
}

export const ApprovalWorkflow = ({ events, onEventUpdated }: ApprovalWorkflowProps) => {
  const { profile } = useAuthContext();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  const getNextStatus = (currentStatus: string, userRole: string) => {
    const approvalFlow = {
      pending_approval: {
        staff: 'pending_student_affairs',
        event_coordinator: 'pending_student_affairs',
        department_head: 'pending_student_affairs',
      },
      pending_student_affairs: {
        dean_student_affairs: 'pending_vc',
      },
      pending_vc: {
        senate_member: 'approved',
      }
    };

    return approvalFlow[currentStatus]?.[userRole] || 'approved';
  };

  const canApprove = (event: Event) => {
    const userRole = profile?.role;
    
    // Check if user can approve based on event status and their role
    switch (event.status) {
      case 'pending_approval':
        return ['staff', 'event_coordinator', 'department_head'].includes(userRole);
      case 'pending_student_affairs':
        return userRole === 'dean_student_affairs';
      case 'pending_vc':
        return userRole === 'senate_member';
      default:
        return false;
    }
  };

  const handleApproval = async (eventId: string, approve: boolean) => {
    setActionLoading(eventId);
    
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) return;

      let newStatus = approve ? getNextStatus(event.status, profile?.role || '') : 'rejected';
      
      const { error } = await supabase
        .from('events')
        .update({
          status: newStatus,
          approval_notes: comments[eventId] || null,
          approver_role: profile?.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      // Clear comment
      setComments(prev => ({ ...prev, [eventId]: '' }));
      
      // Trigger refresh
      onEventUpdated();
      
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-700';
      case 'pending_student_affairs':
        return 'bg-blue-100 text-blue-700';
      case 'pending_vc':
        return 'bg-purple-100 text-purple-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending Initial Approval';
      case 'pending_student_affairs':
        return 'Pending Student Affairs';
      case 'pending_vc':
        return 'Pending VC Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const eventsToApprove = events.filter(event => canApprove(event));

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
                  <span className="font-medium">Date:</span> {new Date(event.start_date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {event.event_type}
                </div>
                {event.max_participants && (
                  <div>
                    <span className="font-medium">Max Participants:</span> {event.max_participants}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Textarea
                  placeholder="Add comments (optional)"
                  value={comments[event.id] || ''}
                  onChange={(e) => setComments(prev => ({ ...prev, [event.id]: e.target.value }))}
                  className="resize-none"
                  rows={2}
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproval(event.id, true)}
                    disabled={actionLoading === event.id}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleApproval(event.id, false)}
                    disabled={actionLoading === event.id}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reject
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
