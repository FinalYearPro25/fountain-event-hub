
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateEventForm } from './CreateEventForm';
import { ArrowLeft, Calendar, Plus } from 'lucide-react';

interface CreateEventProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const CreateEvent = ({ onBack, onSuccess }: CreateEventProps) => {
  const { signOut } = useAuthContext();
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Create Event
                </Button>
              </div>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CreateEventForm 
            onSuccess={() => {
              setShowForm(false);
              onSuccess?.();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
          <p className="text-gray-600 mt-1">Organize a new campus event</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>Organize a new campus event with venue booking and resource management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Create an Event?</h3>
            <p className="text-gray-600 mb-6">
              Use our comprehensive event creation form to plan your next campus event
              with venue booking, resource requests, and approval workflows.
            </p>
            <Button size="lg" onClick={() => setShowForm(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Start Creating Event
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
