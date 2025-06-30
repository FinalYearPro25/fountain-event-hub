
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, DollarSign, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  type: string;
  status: string;
  registered: boolean;
  capacity: number;
  registered_count: number;
  registration_fee?: number;
  organizer?: string;
}

interface EventRegistrationModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrationSuccess?: () => void;
}

export const EventRegistrationModal = ({ 
  event, 
  open, 
  onOpenChange, 
  onRegistrationSuccess 
}: EventRegistrationModalProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const handleRegister = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: event.id,
          user_id: user.id,
          payment_status: event.registration_fee && event.registration_fee > 0 ? 'pending' : 'paid',
          attendance_status: 'registered'
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: `You have successfully registered for ${event.title}.`,
      });

      onRegistrationSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'cultural': return 'bg-purple-100 text-purple-800';
      case 'sports': return 'bg-orange-100 text-orange-800';
      case 'conference': return 'bg-indigo-100 text-indigo-800';
      case 'workshop': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isFull = event.registered_count >= event.capacity;
  const spotsLeft = event.capacity - event.registered_count;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
            <Badge className={getTypeColor(event.type)}>
              {event.type}
            </Badge>
          </div>
          <DialogDescription className="text-left">
            {event.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{event.registered_count}/{event.capacity} registered</span>
            </div>
            {event.registration_fee && event.registration_fee > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>₦{event.registration_fee.toLocaleString()}</span>
              </div>
            )}
            {event.organizer && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{event.organizer}</span>
              </div>
            )}
          </div>

          {/* Registration Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Registration Status</h4>
                <p className="text-sm text-gray-600">
                  {isFull ? 'Event is full' : `${spotsLeft} spots remaining`}
                </p>
              </div>
              <div className="text-right">
                {event.registered ? (
                  <Badge className="bg-green-100 text-green-800">
                    Already Registered
                  </Badge>
                ) : isFull ? (
                  <Badge className="bg-red-100 text-red-800">
                    Full
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800">
                    Available
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Registration Fee Info */}
          {event.registration_fee && event.registration_fee > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Payment Information</h4>
              <p className="text-sm text-blue-800">
                This event requires a registration fee of ₦{event.registration_fee.toLocaleString()}. 
                You will receive payment instructions after registration.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {event.registered ? (
              <Button disabled className="flex-1">
                Already Registered
              </Button>
            ) : isFull ? (
              <Button disabled className="flex-1">
                Event Full
              </Button>
            ) : (
              <Button 
                onClick={handleRegister} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Registering...' : 'Register for Event'}
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
