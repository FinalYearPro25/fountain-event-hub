
import { useState, useEffect } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MoreHorizontal,
  Clock,
  MapPin,
  Filter
} from "lucide-react";

// Simple interface without complex type recursion
interface SimplePendingEvent {
  id: string;
  title: string;
  start_date: string | null;
  venue_id: string | null;
  organizer_id: string | null;
  status: string;
}

export const HODDashboard = () => {
  const { user, profile, signOut } = useAuthContext();
  const [pendingEvents, setPendingEvents] = useState<SimplePendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user || !profile?.department) return;
    
    const fetchPendingEvents = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Query events without the department column since it doesn't exist
        const { data, error: fetchError } = await supabase
          .from("events")
          .select("id, title, start_date, venue_id, organizer_id, status")
          .eq("status", "pending_approval");
          
        if (fetchError) throw fetchError;
        
        // Filter by department through organizer's profile
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
      
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
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
      
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (err) {
      console.error("Error rejecting event:", err);
      setError("Failed to reject event.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = pendingEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Ventixe</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
            <Building2 className="h-4 w-4" />
            Dashboard
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <Calendar className="h-4 w-4" />
            Events
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <FileText className="h-4 w-4" />
            Approvals
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <UserCheck className="h-4 w-4" />
            Staff
          </div>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {profile?.full_name?.charAt(0) || 'H'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-500">Head of Department</p>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile?.department} Dashboard</h1>
              <p className="text-gray-600 mt-1">Hello {profile?.full_name?.split(' ')[0]}, welcome back!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search anything"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-gray-50 border-gray-200"
                />
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {pendingEvents.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingEvents.length}
                  </span>
                )}
              </Button>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {profile?.full_name?.charAt(0) || 'H'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium opacity-90">Pending Events</CardTitle>
                <FileText className="h-4 w-4 opacity-90" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingEvents.length}</div>
                <p className="text-xs opacity-90">Require your approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Total Events</CardTitle>
                <Calendar className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">124</div>
                <p className="text-xs text-gray-600">This semester</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Department Staff</CardTitle>
                <UserCheck className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">32</div>
                <p className="text-xs text-gray-600">Active members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Approved Events</CardTitle>
                <Check className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">89</div>
                <p className="text-xs text-gray-600">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Pending Event Approvals</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Events waiting for your approval</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <p className="ml-3 text-gray-600">Loading events...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="font-medium mb-1">Error Loading Events</div>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Events</h3>
                  <p className="text-gray-600">All departmental events have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-6 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{event.title}</h4>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.start_date 
                                ? new Date(event.start_date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'Date TBD'
                              }
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.venue_id || 'Venue TBD'}
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Pending Review
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => handleApprove(event.id)}
                          disabled={loading}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
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
        </main>
      </div>
    </div>
  );
};
