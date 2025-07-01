import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { VenueSelector } from './VenueSelector';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, DollarSign, Clock, Plus, X, Upload, Image } from 'lucide-react';

interface CreateEventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateEventForm = ({ onSuccess, onCancel }: CreateEventFormProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxParticipants: '',
    registrationFee: '',
    venueId: '',
    bannerImageUrl: '',
    categories: [] as string[],
    targetAudience: [] as string[],
    requirements: [] as string[],
    resources: [] as { id: string; name: string; quantity: number; cost: number }[]
  });

  const eventTypes = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'conference', label: 'Conference' },
    { value: 'social', label: 'Social Event' },
    { value: 'competition', label: 'Competition' },
    { value: 'cultural', label: 'Cultural Event' },
    { value: 'academic', label: 'Academic Event' },
    { value: 'sports', label: 'Sports Event' },
    { value: 'other', label: 'Other' }
  ];

  const categories = [
    'Technology', 'Business', 'Education', 'Health', 'Arts', 'Science',
    'Engineering', 'Law', 'Medicine', 'Management', 'Culture', 'Sports'
  ];

  const targetAudiences = [
    'Students', 'Staff', 'Faculty', 'Alumni', 'External', 'All'
  ];

  const availableResources = [
    { id: 'projector', name: 'Projector', cost: 1000 },
    { id: 'sound-system', name: 'Sound System', cost: 1500 },
    { id: 'microphone', name: 'Microphone', cost: 500 },
    { id: 'chairs', name: 'Additional Chairs', cost: 100 },
    { id: 'tables', name: 'Tables', cost: 200 },
    { id: 'catering', name: 'Catering', cost: 2000 },
    { id: 'security', name: 'Security', cost: 3000 },
    { id: 'photography', name: 'Photography', cost: 5000 }
  ];

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayUpdate = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field as keyof typeof prev] as string[], value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `event-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, bannerImageUrl: publicUrl }));
      setImagePreview(publicUrl);
      
      toast({
        title: "Image uploaded successfully!",
        description: "Your event banner has been uploaded."
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addResource = (resourceId: string) => {
    const resource = availableResources.find(r => r.id === resourceId);
    if (resource && !formData.resources.find(r => r.id === resourceId)) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { ...resource, quantity: 1 }]
      }));
    }
  };

  const updateResourceQuantity = (resourceId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.map(r => 
        r.id === resourceId ? { ...r, quantity } : r
      )
    }));
  };

  const removeResource = (resourceId: string) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== resourceId)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Upload image if file is selected
      if (imageFile) {
        await handleImageUpload(imageFile);
      }

      // Create the event
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.eventType as any,
        start_date: `${formData.startDate}T${formData.startTime}:00`,
        end_date: `${formData.endDate}T${formData.endTime}:00`,
        max_participants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        registration_fee: formData.registrationFee ? parseFloat(formData.registrationFee) : 0,
        venue_id: formData.venueId,
        banner_image_url: formData.bannerImageUrl,
        organizer_id: user.id,
        status: 'draft' as any
      };

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (eventError) {
        throw eventError;
      }

      // Add resources if any
      if (formData.resources.length > 0) {
        const resourceData = formData.resources.map(resource => ({
          event_id: event.id,
          resource_id: resource.id,
          quantity_requested: resource.quantity,
          total_cost: resource.cost * resource.quantity,
          status: 'pending' as any
        }));

        const { error: resourceError } = await supabase
          .from('event_resources')
          .insert(resourceData);

        if (resourceError) {
          console.error('Error adding resources:', resourceError);
        }
      }

      toast({
        title: "Event Created Successfully!",
        description: "Your event has been created and submitted for approval."
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error Creating Event",
        description: "There was an error creating your event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.title && formData.description && formData.eventType;
      case 2:
        return formData.startDate && formData.startTime && formData.endDate && formData.endTime;
      case 3:
        return formData.venueId;
      default:
        return true;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          placeholder="Enter event title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Event Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe your event in detail"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventType">Event Type *</Label>
        <Select onValueChange={(value) => updateFormData('eventType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={formData.categories.includes(category)}
                onCheckedChange={(checked) => 
                  handleArrayUpdate('categories', category, checked as boolean)
                }
              />
              <Label htmlFor={category} className="text-sm">{category}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Target Audience</Label>
        <div className="grid grid-cols-3 gap-2">
          {targetAudiences.map(audience => (
            <div key={audience} className="flex items-center space-x-2">
              <Checkbox
                id={audience}
                checked={formData.targetAudience.includes(audience)}
                onCheckedChange={(checked) => 
                  handleArrayUpdate('targetAudience', audience, checked as boolean)
                }
              />
              <Label htmlFor={audience} className="text-sm">{audience}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateFormData('startDate', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => updateFormData('startTime', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => updateFormData('endDate', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => updateFormData('endTime', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxParticipants">Maximum Participants</Label>
          <Input
            id="maxParticipants"
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => updateFormData('maxParticipants', e.target.value)}
            placeholder="Enter max participants (optional)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationFee">Registration Fee (₦)</Label>
          <Input
            id="registrationFee"
            type="number"
            value={formData.registrationFee}
            onChange={(e) => updateFormData('registrationFee', e.target.value)}
            placeholder="Enter fee (0 for free)"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Event Banner</Label>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bannerImageUrl">Banner Image URL (Optional)</Label>
            <Input
              id="bannerImageUrl"
              type="url"
              value={formData.bannerImageUrl}
              onChange={(e) => updateFormData('bannerImageUrl', e.target.value)}
              placeholder="Enter image URL"
            />
          </div>
          
          <div className="text-center text-gray-500">OR</div>
          
          <div className="space-y-2">
            <Label htmlFor="imageFile">Upload Banner Image</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="imageFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </>
                  )}
                </div>
                <Input
                  id="imageFile"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Select Venue *</Label>
        <VenueSelector
          selectedDate={formData.startDate}
          selectedStartTime={formData.startTime}
          selectedEndTime={formData.endTime}
          onSelectVenue={(venueId: string) => updateFormData('venueId', venueId)}
          value={formData.venueId}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Request Resources</h3>
        <p className="text-sm text-gray-600">
          Select additional resources you need for your event. These will be subject to approval.
        </p>

        <div className="space-y-2">
          <Label>Available Resources</Label>
          <Select onValueChange={addResource}>
            <SelectTrigger>
              <SelectValue placeholder="Add a resource" />
            </SelectTrigger>
            <SelectContent>
              {availableResources
                .filter(resource => !formData.resources.find(r => r.id === resource.id))
                .map(resource => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} - ₦{resource.cost.toLocaleString()}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {formData.resources.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Resources</Label>
            <div className="space-y-2">
              {formData.resources.map(resource => (
                <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{resource.name}</div>
                    <div className="text-sm text-gray-600">
                      ₦{resource.cost.toLocaleString()} per unit
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={resource.quantity}
                      onChange={(e) => updateResourceQuantity(resource.id, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <Badge variant="outline">
                      ₦{(resource.cost * resource.quantity).toLocaleString()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeResource(resource.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total Resource Cost:</span>
                <Badge variant="outline" className="text-lg">
                  ₦{formData.resources.reduce((total, r) => total + (r.cost * r.quantity), 0).toLocaleString()}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Review & Submit</h3>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{formData.title}</CardTitle>
            <CardDescription>{formData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formData.startDate} to {formData.endDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{formData.startTime} - {formData.endTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{formData.maxParticipants || 'Unlimited'} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>{formData.registrationFee ? `₦${formData.registrationFee}` : 'Free'}</span>
              </div>
            </div>

            {(formData.bannerImageUrl || imagePreview) && (
              <div>
                <h4 className="font-medium mb-2">Event Banner</h4>
                <img 
                  src={imagePreview || formData.bannerImageUrl} 
                  alt="Event banner" 
                  className="w-full max-h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {formData.categories.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {formData.categories.map(category => (
                    <Badge key={category} variant="secondary">{category}</Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.targetAudience.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Target Audience</h4>
                <div className="flex flex-wrap gap-1">
                  {formData.targetAudience.map(audience => (
                    <Badge key={audience} variant="outline">{audience}</Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.resources.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Requested Resources</h4>
                <div className="space-y-1">
                  {formData.resources.map(resource => (
                    <div key={resource.id} className="text-sm flex justify-between">
                      <span>{resource.name} x{resource.quantity}</span>
                      <span>₦{(resource.cost * resource.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          <p className="text-gray-600 mt-1">Step {step} of 5</p>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}

          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)} 
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 5 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={!validateStep(step)}
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={loading || uploadingImage}
              >
                {loading ? 'Creating Event...' : uploadingImage ? 'Uploading Image...' : 'Create Event'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
