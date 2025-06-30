
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface CreateEventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateEventForm = ({ onSuccess, onCancel }: CreateEventFormProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    venue_id: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    max_participants: '',
    registration_fee: '',
  });

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [resources, setResources] = useState<Array<{resource_id: string, quantity: number}>>([]);

  const eventTypes = [
    { value: 'academic', label: 'Academic' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' }
  ];

  const venues = [
    { id: '1', name: 'Main Auditorium', capacity: 500 },
    { id: '2', name: 'Engineering Hall A', capacity: 150 },
    { id: '3', name: 'Science Lab Complex', capacity: 80 },
    { id: '4', name: 'Business Conference Room', capacity: 50 }
  ];

  const availableResources = [
    { id: '1', name: 'Projector', price: 50 },
    { id: '2', name: 'Sound System', price: 100 },
    { id: '3', name: 'Round Tables', price: 20 },
    { id: '4', name: 'Chairs', price: 5 },
    { id: '5', name: 'Catering Package', price: 15 }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Combine date and time
      const startDateTime = formData.start_date && startTime ? 
        new Date(`${format(formData.start_date, 'yyyy-MM-dd')}T${startTime}`) : null;
      const endDateTime = formData.end_date && endTime ? 
        new Date(`${format(formData.end_date, 'yyyy-MM-dd')}T${endTime}`) : null;

      const { data: event, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          event_type: formData.event_type as any,
          organizer_id: user.id,
          venue_id: formData.venue_id || null,
          start_date: startDateTime?.toISOString(),
          end_date: endDateTime?.toISOString(),
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
          registration_fee: formData.registration_fee ? parseFloat(formData.registration_fee) : 0,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Event Created Successfully",
        description: "Your event has been created and saved as a draft.",
      });

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error Creating Event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addResource = () => {
    setResources([...resources, { resource_id: '', quantity: 1 }]);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Fill in the details to create a new campus event</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type *</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({ ...formData, start_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Select value={formData.venue_id} onValueChange={(value) => setFormData({ ...formData, venue_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} (Cap: {venue.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                placeholder="Enter max participants"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_fee">Registration Fee (₦)</Label>
              <Input
                id="registration_fee"
                type="number"
                step="0.01"
                value={formData.registration_fee}
                onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Resource Requirements</Label>
              <Button type="button" variant="outline" size="sm" onClick={addResource}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>
            
            {resources.map((resource, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <Select 
                  value={resource.resource_id} 
                  onValueChange={(value) => {
                    const newResources = [...resources];
                    newResources[index].resource_id = value;
                    setResources(newResources);
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableResources.map((res) => (
                      <SelectItem key={res.id} value={res.id}>
                        {res.name} (₦{res.price}/unit)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  min="1"
                  value={resource.quantity}
                  onChange={(e) => {
                    const newResources = [...resources];
                    newResources[index].quantity = parseInt(e.target.value) || 1;
                    setResources(newResources);
                  }}
                  className="w-20"
                  placeholder="Qty"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeResource(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Event"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
