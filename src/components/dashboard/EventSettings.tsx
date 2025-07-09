
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { ArrowLeft, Settings, Save, Bell, Mail, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventSettingsProps {
  onBack: () => void;
}

export const EventSettings = ({ onBack }: EventSettingsProps) => {
  const { profile } = useAuthContext();
  const { toast } = useToast();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    approvalReminders: true,
    eventUpdates: true,
    deadlineAlerts: true,
    
    // Event Defaults
    defaultEventDuration: "2",
    defaultCapacity: "50",
    defaultDescription: "",
    autoAssignVenue: false,
    
    // Approval Settings
    requireComments: false,
    autoApprovalLimit: "10",
    escalationDays: "3",
    
    // Display Settings
    showEventDetails: true,
    showOrganizerInfo: true,
    showParticipantCount: true,
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would save these to a database
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Settings Saved",
        description: "Your event settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
              <Settings className="h-8 w-8 text-emerald-600" />
              Event Settings
            </h1>
            <p className="text-emerald-600 mt-1">
              Customize your event management preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* User Profile Section */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile?.full_name || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile?.role || ''}
                    disabled
                    className="bg-gray-50 capitalize"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile?.department || 'Not specified'}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="approvalReminders">Approval Reminders</Label>
                  <p className="text-sm text-gray-600">Get reminded about pending approvals</p>
                </div>
                <Switch
                  id="approvalReminders"
                  checked={settings.approvalReminders}
                  onCheckedChange={(checked) => handleSettingChange('approvalReminders', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="eventUpdates">Event Updates</Label>
                  <p className="text-sm text-gray-600">Notifications for event status changes</p>
                </div>
                <Switch
                  id="eventUpdates"
                  checked={settings.eventUpdates}
                  onCheckedChange={(checked) => handleSettingChange('eventUpdates', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="deadlineAlerts">Deadline Alerts</Label>
                  <p className="text-sm text-gray-600">Alerts for upcoming deadlines</p>
                </div>
                <Switch
                  id="deadlineAlerts"
                  checked={settings.deadlineAlerts}
                  onCheckedChange={(checked) => handleSettingChange('deadlineAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Event Defaults */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Event Defaults
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultDuration">Default Event Duration (hours)</Label>
                  <Input
                    id="defaultDuration"
                    type="number"
                    value={settings.defaultEventDuration}
                    onChange={(e) => handleSettingChange('defaultEventDuration', e.target.value)}
                    min="1"
                    max="24"
                  />
                </div>
                <div>
                  <Label htmlFor="defaultCapacity">Default Capacity</Label>
                  <Input
                    id="defaultCapacity"
                    type="number"
                    value={settings.defaultCapacity}
                    onChange={(e) => handleSettingChange('defaultCapacity', e.target.value)}
                    min="1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="defaultDescription">Default Event Description Template</Label>
                <Textarea
                  id="defaultDescription"
                  placeholder="Enter a template for event descriptions..."
                  value={settings.defaultDescription}
                  onChange={(e) => handleSettingChange('defaultDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAssignVenue">Auto-assign Venues</Label>
                  <p className="text-sm text-gray-600">Automatically suggest available venues</p>
                </div>
                <Switch
                  id="autoAssignVenue"
                  checked={settings.autoAssignVenue}
                  onCheckedChange={(checked) => handleSettingChange('autoAssignVenue', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Approval Settings */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Approval Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireComments">Require Comments for Rejection</Label>
                  <p className="text-sm text-gray-600">Force users to provide reasons when rejecting</p>
                </div>
                <Switch
                  id="requireComments"
                  checked={settings.requireComments}
                  onCheckedChange={(checked) => handleSettingChange('requireComments', checked)}
                />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="autoApprovalLimit">Auto-approval Limit (participants)</Label>
                  <Input
                    id="autoApprovalLimit"
                    type="number"
                    value={settings.autoApprovalLimit}
                    onChange={(e) => handleSettingChange('autoApprovalLimit', e.target.value)}
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Events with fewer participants can be auto-approved</p>
                </div>
                <div>
                  <Label htmlFor="escalationDays">Escalation Days</Label>
                  <Input
                    id="escalationDays"
                    type="number"
                    value={settings.escalationDays}
                    onChange={(e) => handleSettingChange('escalationDays', e.target.value)}
                    min="1"
                    max="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">Days before escalating pending approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Display Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showEventDetails">Show Event Details</Label>
                  <p className="text-sm text-gray-600">Display detailed event information</p>
                </div>
                <Switch
                  id="showEventDetails"
                  checked={settings.showEventDetails}
                  onCheckedChange={(checked) => handleSettingChange('showEventDetails', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showOrganizerInfo">Show Organizer Information</Label>
                  <p className="text-sm text-gray-600">Display organizer details in event cards</p>
                </div>
                <Switch
                  id="showOrganizerInfo"
                  checked={settings.showOrganizerInfo}
                  onCheckedChange={(checked) => handleSettingChange('showOrganizerInfo', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showParticipantCount">Show Participant Count</Label>
                  <p className="text-sm text-gray-600">Display current registration count</p>
                </div>
                <Switch
                  id="showParticipantCount"
                  checked={settings.showParticipantCount}
                  onCheckedChange={(checked) => handleSettingChange('showParticipantCount', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
