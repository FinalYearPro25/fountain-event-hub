
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { VenueSelector } from "./VenueSelector";

interface CreateEventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateEventForm = ({
  onSuccess,
  onCancel,
}: CreateEventFormProps) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "",
    venue_id: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    max_participants: "",
    registration_fee: "",
    banner_url: "",
    recurrence: "",
    template: "",
  });

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [resources, setResources] = useState<
    Array<{ resource_id: string; quantity: number }>
  >([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [availableResources, setAvailableResources] = useState([]);
  const [resourceAvailability, setResourceAvailability] = useState({});

  const eventTypes = [
    { value: "academic", label: "Academic" },
    { value: "cultural", label: "Cultural" },
    { value: "sports", label: "Sports" },
    { value: "conference", label: "Conference" },
    { value: "workshop", label: "Workshop" },
    { value: "seminar", label: "Seminar" },
  ];

  // Fetch resources and their availability
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data: resourcesData } = await supabase
          .from("resources")
          .select("*")
          .eq("is_active", true);
        setAvailableResources(resourcesData || []);
      } catch (error) {
        console.error("Error fetching resources:", error);
        // Mock resources for demonstration
        setAvailableResources([
          { id: "1", name: "Projector", category: "audio_visual", price_per_unit: 500, available_quantity: 10 },
          { id: "2", name: "Sound System", category: "audio_visual", price_per_unit: 1000, available_quantity: 5 },
          { id: "3", name: "Chairs", category: "furniture", price_per_unit: 50, available_quantity: 200 },
          { id: "4", name: "Tables", category: "furniture", price_per_unit: 100, available_quantity: 50 },
          { id: "5", name: "Microphones", category: "audio_visual", price_per_unit: 200, available_quantity: 15 },
          { id: "6", name: "Refreshments", category: "catering", price_per_unit: 300, available_quantity: 100 },
        ]);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      const availability = {};
      for (const res of availableResources) {
        availability[res.id] = res.available_quantity;
      }
      setResourceAvailability(availability);
    };
    fetchAvailability();
  }, [availableResources, formData.start_date, startTime, endTime]);

  // Calculate total cost
  const totalResourceCost = resources.reduce((sum, r) => {
    const res = availableResources.find((ar) => ar.id === r.resource_id);
    return sum + (res?.price_per_unit || 0) * (r.quantity || 1);
  }, 0);

  // Group resources by category
  const resourcesByCategory = availableResources.reduce((acc, res) => {
    acc[res.category] = acc[res.category] || [];
    acc[res.category].push(res);
    return acc;
  }, {});

  const addResource = () => {
    setResources([...resources, { resource_id: "", quantity: 1 }]);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  // Handle banner upload
  const handleBannerUpload = async () => {
    if (!bannerFile) return null;
    setUploading(true);
    try {
      const fileExt = bannerFile.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("event-banners")
        .upload(fileName, bannerFile);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from("event-banners")
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload banner image",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Final submit handler
  const handleFinalSubmit = async (status: "draft" | "pending_approval") => {
    if (!user) return;
    setLoading(true);
    
    try {
      let bannerUrl = formData.banner_url;
      if (bannerFile) {
        bannerUrl = await handleBannerUpload();
      }

      const startDateTime =
        formData.start_date && startTime
          ? new Date(
              `${format(formData.start_date, "yyyy-MM-dd")}T${startTime}`
            )
          : null;
      const endDateTime =
        formData.end_date && endTime
          ? new Date(`${format(formData.end_date, "yyyy-MM-dd")}T${endTime}`)
          : null;

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          title: formData.title,
          description: formData.description,
          event_type: formData.event_type as any,
          organizer_id: user.id,
          venue_id: formData.venue_id || null,
          start_date: startDateTime?.toISOString(),
          end_date: endDateTime?.toISOString(),
          max_participants: formData.max_participants
            ? parseInt(formData.max_participants)
            : null,
          registration_fee: formData.registration_fee
            ? parseFloat(formData.registration_fee)
            : 0,
          status,
          banner_image_url: bannerUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Create venue booking if venue is selected
      if (formData.venue_id && startDateTime && endDateTime) {
        await supabase.from("venue_bookings").insert({
          venue_id: formData.venue_id,
          event_id: event.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          booked_by: user.id,
          booking_type: "event",
          status: "active",
        });
      }

      // Create resource requests
      if (resources.length > 0) {
        const resourceRequests = resources.map((resource) => ({
          event_id: event.id,
          resource_id: resource.resource_id,
          quantity_requested: resource.quantity,
          total_cost: (availableResources.find(r => r.id === resource.resource_id)?.price_per_unit || 0) * resource.quantity,
          status: "pending",
        }));

        await supabase.from("event_resources").insert(resourceRequests);
      }

      toast({
        title: status === "draft" ? "Event Saved as Draft" : "Event Submitted",
        description:
          status === "draft"
            ? "You can continue editing this event later."
            : "Your event has been submitted for approval.",
      });

      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error Creating Event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Basic Info
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="event_type">Event Type *</Label>
        <Select
          value={formData.event_type}
          onValueChange={(value) =>
            setFormData({ ...formData, event_type: value })
          }
        >
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
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe your event..."
          rows={4}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => setStep(2)}
          disabled={!formData.title || !formData.event_type}
        >
          Next
        </Button>
      </div>
    </div>
  );

  // Step 2: Date, Time & Venue
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date
                  ? format(formData.start_date, "PPP")
                  : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.start_date}
                onSelect={(date) =>
                  setFormData({ ...formData, start_date: date })
                }
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
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date
                  ? format(formData.end_date, "PPP")
                  : "Pick end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.end_date}
                onSelect={(date) =>
                  setFormData({ ...formData, end_date: date })
                }
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
      <div className="space-y-2">
        <Label>Select Venue *</Label>
        <VenueSelector
          selectedDate={
            formData.start_date ? format(formData.start_date, "yyyy-MM-dd") : ""
          }
          selectedStartTime={startTime}
          selectedEndTime={endTime}
          value={formData.venue_id}
          onSelectVenue={(venueId) =>
            setFormData({ ...formData, venue_id: venueId })
          }
        />
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => setStep(3)}
          disabled={
            !formData.start_date || !formData.end_date || !startTime || !endTime || !formData.venue_id
          }
        >
          Next
        </Button>
      </div>
    </div>
  );

  // Step 3: Additional Details
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="max_participants">Max Participants</Label>
          <Input
            id="max_participants"
            type="number"
            value={formData.max_participants}
            onChange={(e) =>
              setFormData({ ...formData, max_participants: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, registration_fee: e.target.value })
            }
            placeholder="0.00"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Event Banner</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
        />
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button type="button" onClick={() => setStep(4)}>
          Next
        </Button>
      </div>
    </div>
  );

  // Step 4: Review & Submit
  const renderStep4 = () => (
    <div className="space-y-4">
      <CardTitle>Review Event Details</CardTitle>
      <div className="space-y-2">
        <div><b>Title:</b> {formData.title}</div>
        <div><b>Type:</b> {formData.event_type}</div>
        <div><b>Description:</b> {formData.description}</div>
        <div><b>Start:</b> {formData.start_date ? format(formData.start_date, "PPP") : ""} {startTime}</div>
        <div><b>End:</b> {formData.end_date ? format(formData.end_date, "PPP") : ""} {endTime}</div>
        <div><b>Max Participants:</b> {formData.max_participants}</div>
        <div><b>Registration Fee:</b> ₦{formData.registration_fee}</div>
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => handleFinalSubmit("draft")}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          type="button"
          onClick={() => handleFinalSubmit("pending_approval")}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit for Approval"}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Step-by-step event creation wizard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full ${step === s ? "bg-blue-600" : "bg-gray-200"}`}
            ></div>
          ))}
        </div>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </CardContent>
    </Card>
  );
};
