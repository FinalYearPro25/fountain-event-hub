
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
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Role Confirmation */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dean Dashboard</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 border-green-200 text-green-800 bg-green-50">
                <UserCheck className="h-4 w-4" />
                {getRoleDisplayName(profile?.role || 'dean')}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-800">
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

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="border-green-100 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="text-green-800">Quick Actions</CardTitle>
              <CardDescription>Essential dean tasks</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                  <FileCheck className="h-4 w-4" />
                  Review Pending Approvals
                </Button>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  <Eye className="h-4 w-4 mr-2" />
                  View All College Events
                </Button>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage College Venues
                </Button>
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  <Users className="h-4 w-4 mr-2" />
                  View Staff & Students
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Approvals</CardTitle>
              <FileCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <p className="text-xs text-gray-500">Require review</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">College Events</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">23</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Department Staff</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">45</div>
              <p className="text-xs text-gray-500">Active members</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Budget Utilization</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">72%</div>
              <p className="text-xs text-gray-500">Of allocated budget</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-green-100 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <FileCheck className="h-5 w-5" />
                Approval Queue
              </CardTitle>
              <CardDescription>Events waiting for your approval</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-yellow-50 border-l-4 border-yellow-400">
                  <div>
                    <p className="font-medium text-gray-900">Annual Research Symposium</p>
                    <p className="text-sm text-gray-600">Requested by Dr. Smith • Budget: ₦500,000</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">Review</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 border-l-4 border-blue-400">
                  <div>
                    <p className="font-medium text-gray-900">Student Innovation Fair</p>
                    <p className="text-sm text-gray-600">Requested by Prof. Johnson • Budget: ₦300,000</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">Review</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 border-l-4 border-green-400">
                  <div>
                    <p className="font-medium text-gray-900">Faculty Workshop</p>
                    <p className="text-sm text-gray-600">Requested by Dean Office • Budget: ₦150,000</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">Review</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100 shadow-sm">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Building className="h-5 w-5" />
                College Overview
              </CardTitle>
              <CardDescription>Recent activities in your college</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Engineering Expo 2024</p>
                    <p className="text-sm text-gray-600">Successfully completed • 200 attendees</p>
                  </div>
                  <Badge className="bg-green-600 text-white">Completed</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Faculty Workshop</p>
                    <p className="text-sm text-gray-600">Ongoing • 25 participants</p>
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Graduation Ceremony</p>
                    <p className="text-sm text-gray-600">Planned for March 2025</p>
                  </div>
                  <Badge variant="outline" className="border-gray-300 text-gray-700">Scheduled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
