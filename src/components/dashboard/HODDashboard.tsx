
import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { UserHeader } from "@/components/common/UserHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UserCheck, 
  FileText, 
  Building2, 
  Calendar,
  Search,
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
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .in("status", ["pending_approval", "pending_student_affairs", "pending_vc"]);
        
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

  const filteredEvents = pendingEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader 
        title="HOD Dashboard" 
        subtitle={`Department of ${profile?.department || 'Unknown'}`}
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
              <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
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

        <div className="mb-8">
          <ApprovalWorkflow 
            events={filteredEvents} 
            onEventUpdated={fetchPendingEvents}
          />
        </div>
      </div>
    </div>
  );
};
