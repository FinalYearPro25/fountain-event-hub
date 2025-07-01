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
import { RichTextEditor } from "@mantine/rte";
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

  const venues = [
    { id: "1", name: "Main Auditorium", capacity: 500 },
    { id: "2", name: "Engineering Hall A", capacity: 150 },
    { id: "3", name: "Science Lab Complex", capacity: 80 },
    { id: "4", name: "Business Conference Room", capacity: 50 },
  ];

  // Fetch resources and their availability
  useEffect(() => {
    const fetchResources = async () => {
      const { data: resourcesData } = await supabase
        .from("resources")
        .select("*")
        .eq("is_active", true);
      setAvailableResources(resourcesData || []);
    };
    fetchResources();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      const availability = {};
      for (const res of availableResources) {
        // For demo: just use available_quantity field. For real: check bookings for selected date/time.
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Combine date and time
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
          status: "draft",
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
    setResources([...resources, { resource_id: "", quantity: 1 }]);
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
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
        <Label htmlFor="template">Event Template</Label>
        <Input
          id="template"
          value={formData.template}
          onChange={(e) =>
            setFormData({ ...formData, template: e.target.value })
          }
          placeholder="(Optional) Use a template name"
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

  // Step 2: Description (Rich Text)
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
        />
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button type="button" onClick={() => setStep(3)}>
          Next
        </Button>
      </div>
    </div>
  );

  // Step 3: Banner Image Upload
  const handleBannerUpload = async () => {
    if (!bannerFile) return;
    setUploading(true);
    const fileExt = bannerFile.name.split(".").pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("event-banners")
      .upload(fileName, bannerFile);
    setUploading(false);
    if (error) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    return data?.path
      ? supabase.storage.from("event-banners").getPublicUrl(data.path).data
          .publicUrl
      : null;
  };
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Event Banner</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
        />
        {formData.banner_url && (
          <img
            src={formData.banner_url}
            alt="Event Banner"
            className="mt-2 rounded w-full max-h-48 object-cover"
          />
        )}
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button
          type="button"
          onClick={async () => {
            if (bannerFile) {
              const url = await handleBannerUpload();
              if (url) setFormData({ ...formData, banner_url: url });
            }
            setStep(4);
          }}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Next"}
        </Button>
      </div>
    </div>
  );

  // Step 4: Date, Time, Recurrence
  const renderStep4 = () => (
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
        <Label htmlFor="recurrence">Recurrence</Label>
        <Select
          value={formData.recurrence}
          onValueChange={(value) =>
            setFormData({ ...formData, recurrence: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="None (one-time event)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => setStep(3)}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => setStep(5)}
          disabled={
            !formData.start_date || !formData.end_date || !startTime || !endTime
          }
        >
          Next
        </Button>
      </div>
    </div>
  );

  // Step 5: Venue, Resources, Participants, Fee
  const renderStep5 = () => (
    <div className="space-y-4">
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Resource Requirements</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addResource}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Resource
          </Button>
        </div>
        {/* Grouped by category */}
        {Object.entries(resourcesByCategory).map(([category, resList]) => (
          <div key={category} className="mb-2">
            <div className="font-semibold mb-1">
              {category.replace("_", " ").toUpperCase()}
            </div>
            {resources
              .filter((r) => resList.some((ar) => ar.id === r.resource_id))
              .map((resource, index) => {
                const res = availableResources.find(
                  (ar) => ar.id === resource.resource_id
                );
                const availableQty =
                  resourceAvailability[resource.resource_id] || 0;
                return (
                  <div
                    key={resource.resource_id}
                    className="flex flex-col md:flex-row items-center gap-2 p-2 border rounded mb-2"
                  >
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
                        {resList.map((ar) => (
                          <SelectItem
                            key={ar.id}
                            value={ar.id}
                            disabled={resourceAvailability[ar.id] === 0}
                          >
                            {ar.name} (₦{ar.price_per_unit}/unit,{" "}
                            {resourceAvailability[ar.id]} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      max={availableQty}
                      value={resource.quantity}
                      onChange={(e) => {
                        const newResources = [...resources];
                        newResources[index].quantity = Math.min(
                          parseInt(e.target.value) || 1,
                          availableQty
                        );
                        setResources(newResources);
                      }}
                      className="w-20"
                      placeholder="Qty"
                      disabled={availableQty === 0}
                    />
                    <div className="text-xs text-gray-500">
                      ₦{(res?.price_per_unit || 0) * (resource.quantity || 1)}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Delivery</Label>
                      <Input
                        type="datetime-local"
                        value={resource.delivery_time || ""}
                        onChange={(e) => {
                          const newResources = [...resources];
                          newResources[index].delivery_time = e.target.value;
                          setResources(newResources);
                        }}
                        className="w-40"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">Return</Label>
                      <Input
                        type="datetime-local"
                        value={resource.return_time || ""}
                        onChange={(e) => {
                          const newResources = [...resources];
                          newResources[index].return_time = e.target.value;
                          setResources(newResources);
                        }}
                        className="w-40"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeResource(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
          </div>
        ))}
        <div className="font-semibold text-right">
          Total Resource Cost: ₦{totalResourceCost}
        </div>
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => setStep(4)}>
          Back
        </Button>
        <Button
          type="button"
          onClick={() => setStep(6)}
          disabled={!formData.venue_id}
        >
          Next
        </Button>
      </div>
    </div>
  );

  // Step 6: Review & Save
  const handleFinalSubmit = async (status: "draft" | "pending_approval") => {
    if (!user) return;
    setLoading(true);
    try {
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
          banner_url: formData.banner_url,
          recurrence: formData.recurrence,
          template: formData.template,
        })
        .select()
        .single();
      if (error) throw error;
      toast({
        title: status === "draft" ? "Event Saved as Draft" : "Event Submitted",
        description:
          status === "draft"
            ? "You can continue editing this event later."
            : "Your event has been submitted for approval.",
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
  const renderStep6 = () => (
    <div className="space-y-4">
      <CardTitle>Review Event Details</CardTitle>
      <div className="space-y-2">
        <div>
          <b>Title:</b> {formData.title}
        </div>
        <div>
          <b>Type:</b> {formData.event_type}
        </div>
        <div>
          <b>Template:</b> {formData.template}
        </div>
        <div>
          <b>Description:</b>{" "}
          <span dangerouslySetInnerHTML={{ __html: formData.description }} />
        </div>
        {formData.banner_url && (
          <img
            src={formData.banner_url}
            alt="Event Banner"
            className="rounded w-full max-h-48 object-cover"
          />
        )}
        <div>
          <b>Start:</b>{" "}
          {formData.start_date ? format(formData.start_date, "PPP") : ""}{" "}
          {startTime}
        </div>
        <div>
          <b>End:</b>{" "}
          {formData.end_date ? format(formData.end_date, "PPP") : ""} {endTime}
        </div>
        <div>
          <b>Recurrence:</b> {formData.recurrence || "None"}
        </div>
        <div>
          <b>Venue:</b>{" "}
          {venues.find((v) => v.id === formData.venue_id)?.name || ""}
        </div>
        <div>
          <b>Max Participants:</b> {formData.max_participants}
        </div>
        <div>
          <b>Registration Fee:</b> ₦{formData.registration_fee}
        </div>
        <div>
          <b>Resources:</b>{" "}
          {resources
            .map(
              (r, i) =>
                `${availableResources.find((ar) => ar.id === r.resource_id)?.name || ""} (x${r.quantity})`
            )
            .join(", ")}
        </div>
      </div>
      <div className="flex justify-between gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => setStep(5)}>
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

  // Render stepper
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Step-by-step event creation wizard</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6].map((s) => (
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
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
      </CardContent>
    </Card>
  );
};
