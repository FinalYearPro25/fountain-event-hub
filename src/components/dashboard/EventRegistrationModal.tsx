
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, MapPin, Users, DollarSign, Clock, 
  User, Phone, Mail, CheckCircle, AlertCircle 
} from 'lucide-react';

interface EventRegistrationModalProps {
  event: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const EventRegistrationModal = ({ event, onClose, onSuccess }: EventRegistrationModalProps) => {
  const { user, profile } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    specialRequirements: '',
    emergencyContact: '',
    emergencyPhone: '',
    dietaryRestrictions: '',
    medicalConditions: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegistration = async () => {
    if (!user || !event) return;

    setLoading(true);
    try {
      // Register for the event
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert({
          event_id: String(event.id),
          user_id: user.id,
          payment_status: event.fee > 0 ? 'pending' : 'paid'
        });

      if (registrationError) {
        throw registrationError;
      }

      // If there's a fee, you would integrate with payment gateway here
      if (event.fee > 0) {
        // For now, we'll simulate payment processing
        const paymentReference = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Update registration with payment reference
        const { error: updateError } = await supabase
          .from('event_registrations')
          .update({ 
            payment_reference: paymentReference,
            payment_status: 'paid' // In real app, this would be updated by payment webhook
          })
          .eq('event_id', String(event.id))
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating payment reference:', updateError);
        }
      }

      setStep(3); // Success step
      toast({
        title: "Registration Successful!",
        description: "You have been successfully registered for this event."
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for this event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Event Details</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{event.registered}/{event.capacity} registered</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>{event.fee === 0 ? 'Free' : `₦${event.fee.toLocaleString()}`}</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-gray-600 text-sm">{event.description}</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Organizer</h4>
          <p className="text-gray-600 text-sm">{event.organizer}</p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => setStep(2)}>
          Continue Registration
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Registration Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={profile?.full_name || ''} 
              disabled 
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              value={profile?.email || ''} 
              disabled 
              className="bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
            <Input
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              placeholder="Enter emergency contact name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
            <Input
              id="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              placeholder="Enter emergency contact phone"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
          <Textarea
            id="dietaryRestrictions"
            value={formData.dietaryRestrictions}
            onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
            placeholder="Any dietary restrictions or allergies?"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Medical Conditions</Label>
          <Textarea
            id="medicalConditions"
            value={formData.medicalConditions}
            onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
            placeholder="Any medical conditions we should be aware of?"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialRequirements">Special Requirements</Label>
          <Textarea
            id="specialRequirements"
            value={formData.specialRequirements}
            onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
            placeholder="Any special requirements or accessibility needs?"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={handleRegistration} disabled={loading}>
          {loading ? 'Registering...' : 'Complete Registration'}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-4 py-8">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h3 className="text-xl font-bold text-green-800">Registration Successful!</h3>
      <p className="text-gray-600">
        You have been successfully registered for <strong>{event.title}</strong>
      </p>
      <p className="text-sm text-gray-500">
        You will receive a confirmation email shortly with event details.
      </p>
      <Button onClick={onSuccess} className="mt-4">
        Done
      </Button>
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Register for Event
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{event.category}</Badge>
              {event.fee > 0 && (
                <Badge variant="outline" className="text-green-600">
                  ₦{event.fee.toLocaleString()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
