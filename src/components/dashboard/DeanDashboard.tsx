
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileCheck, TrendingUp, UserCheck, Building, MapPin, Eye } from "lucide-react";

export const DeanDashboard = () => {
  const { user, profile, signOut } = useAuthContext();

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'dean': 'DEAN',
      'department_head': 'DEPARTMENT HEAD',
    };
    return roleMap[role] || role.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Role Confirmation */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dean Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <UserCheck className="h-4 w-4" />
                You are logged in as: {getRoleDisplayName(profile?.role || 'dean')}
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

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Essential dean tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Review Pending Approvals
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View All College Events
                </Button>
                <Button variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage College Venues
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View Staff & Students
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Require review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">College Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Department Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72%</div>
              <p className="text-xs text-muted-foreground">Of allocated budget</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Approval Queue
              </CardTitle>
              <CardDescription>Events waiting for your approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-500">
                  <div>
                    <p className="font-medium">Annual Research Symposium</p>
                    <p className="text-sm text-gray-600">Requested by Dr. Smith • Budget: ₦500,000</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-500">
                  <div>
                    <p className="font-medium">Student Innovation Fair</p>
                    <p className="text-sm text-gray-600">Requested by Prof. Johnson • Budget: ₦300,000</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border-l-4 border-green-500">
                  <div>
                    <p className="font-medium">Faculty Workshop</p>
                    <p className="text-sm text-gray-600">Requested by Dean Office • Budget: ₦150,000</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                College Overview
              </CardTitle>
              <CardDescription>Recent activities in your college</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Engineering Expo 2024</p>
                    <p className="text-sm text-gray-600">Successfully completed • 200 attendees</p>
                  </div>
                  <Badge variant="default">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Faculty Workshop</p>
                    <p className="text-sm text-gray-600">Ongoing • 25 participants</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Graduation Ceremony</p>
                    <p className="text-sm text-gray-600">Planned for March 2025</p>
                  </div>
                  <Badge variant="outline">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
