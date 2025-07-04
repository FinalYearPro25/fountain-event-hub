// Type definitions for VC Dashboard
interface Event {
  id: string;
  title: string;
  start_date?: string;
  venue_id?: string;
  status?: string;
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
import { useToast } from "@/hooks/use-toast";

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
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("status", "pending_vc");
        if (error) throw error;
        setPendingEvents(data || []);
        // Fetch pending registrations
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
        .update({ status: "approved" })
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

  const handleApproveRegistration = async (reg: PendingRegistration) => {
    setLoading(true);
    try {
      // Insert user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: reg.user_id, role: reg.requested_role });
      if (roleError) throw roleError;
      // Update registration status
      const { error: updateError } = await supabase
        .from("pending_registrations")
        .update({ status: "approved" })
        .eq("id", reg.id);
      if (updateError) throw updateError;
      setPendingRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
      toast({
        title: "Registration Approved",
        description: `${reg.full_name} is now a ${reg.requested_role}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve registration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRegistration = async (reg: PendingRegistration) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("pending_registrations")
        .update({ status: "rejected" })
        .eq("id", reg.id);
      if (error) throw error;
      setPendingRegistrations((prev) => prev.filter((r) => r.id !== reg.id));
      toast({
        title: "Registration Rejected",
        description: `${reg.full_name}'s registration was rejected.`,
        variant: "destructive",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject registration.",
        variant: "destructive",
      });
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
              Senate Member Dashboard
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-3 py-1"
              >
                <UserCheck className="h-4 w-4" />
                You are logged in as: Senate Member
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
        {/* Pending Registrations Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Pending Staff/Dean/Senate Member Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRegistrations.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No pending registrations.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{reg.full_name}</div>
                      <div className="text-xs text-gray-500">
                        {reg.email} • {reg.requested_role}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleApproveRegistration(reg)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectRegistration(reg)}
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
        {/* Existing Pending Events Section */}
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
