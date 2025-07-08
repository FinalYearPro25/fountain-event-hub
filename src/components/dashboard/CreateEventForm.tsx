import { useState } from "react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { VenueSelector } from "./VenueSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Upload, X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type EventType = Database["public"]["Enums"]["event_type"];
type EventStatus = Database["public"]["Enums"]["event_status"];

interface CreateEventFormProps {
  onClose: () => void;
  onEventCreated: () => void;
}

export const CreateEventForm = ({
  onClose,
  onEventCreated,
}: CreateEventFormProps) => {
  const { user, profile } = useAuthContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "" as EventType,
    startDate: new Date(),
    endDate: new Date(),
    startTime: "09:00",
    endTime: "17:00",
    maxParticipants: "",
    registrationFee: "0",
    venueId: "",
    approverRole: "staff", // Default approver role
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadBanner = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `event-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("event-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading banner:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to create an event.",
        variant: "destructive",
      });
      return;
    }
    if (!profile) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before creating an event.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let bannerUrl = null;

      if (bannerFile) {
        bannerUrl = await uploadBanner(bannerFile);
        if (!bannerUrl) {
          toast({
            title: "Upload Error",
            description: "Failed to upload banner image. Please try again.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Validate venue selection
      if (!formData.venueId) {
        toast({
          title: "Venue Required",
          description: "Please select a venue for your event.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const startDateTime = new Date(formData.startDate);
      const [startHours, startMinutes] = formData.startTime.split(":");
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes));

      const endDateTime = new Date(formData.endDate);
      const [endHours, endMinutes] = formData.endTime.split(":");
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes));

      const eventData = {
        title: formData.title,
        description: formData.description,
        event_type: formData.eventType as EventType,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        max_participants: formData.maxParticipants
          ? parseInt(formData.maxParticipants)
          : null,
        registration_fee: parseFloat(formData.registrationFee),
        venue_id: formData.venueId, // Use venue name as ID
        organizer_id: user.id,
        banner_image_url: bannerUrl,
        status: "draft" as EventStatus,
        approver_role: formData.approverRole, // Store selected approver role
      };

      const { data, error } = await supabase
        .from("events")
        .insert(eventData)
        .select()
        .single();

      if (error) {
        console.error("Error creating event:", error);
        toast({
          title: "Error",
          description:
            error.message || "Failed to create event. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Success!",
        description: "Event created successfully!",
      });

      onEventCreated();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <CardDescription>
            Fill in the details to create your event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("eventType", value as EventType)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your event"
                rows={4}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Start Date & Time</Label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={format(formData.startDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      handleInputChange("startDate", new Date(e.target.value))
                    }
                    required
                  />
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>End Date & Time</Label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={format(formData.endDate, "yyyy-MM-dd")}
                    onChange={(e) =>
                      handleInputChange("endDate", new Date(e.target.value))
                    }
                    required
                  />
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* Venue Selection */}
            <div className="space-y-2">
              <Label>Venue</Label>
              <VenueSelector
                selectedDate={format(formData.startDate, "yyyy-MM-dd")}
                selectedStartTime={formData.startTime}
                selectedEndTime={formData.endTime}
                onSelectVenue={(venueId) =>
                  handleInputChange("venueId", venueId)
                }
                value={formData.venueId}
                requiredCapacity={parseInt(formData.maxParticipants) || 0}
              />
            </div>

            {/* Approver Selection */}
            <div className="space-y-2">
              <Label htmlFor="approverRole">Select Approver</Label>
              <Select
                value={formData.approverRole}
                onValueChange={(value) =>
                  handleInputChange("approverRole", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approver role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="dean">Dean</SelectItem>
                  <SelectItem value="department_head">HOD</SelectItem>
                  <SelectItem value="student_affairs">
                    Student Affairs
                  </SelectItem>
                  <SelectItem value="senate_member">Senate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Capacity and Fee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    handleInputChange("maxParticipants", e.target.value)
                  }
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationFee">Registration Fee (₦)</Label>
                <Input
                  id="registrationFee"
                  type="number"
                  step="0.01"
                  value={formData.registrationFee}
                  onChange={(e) =>
                    handleInputChange("registrationFee", e.target.value)
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label>Event Banner</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {bannerPreview ? (
                  <div className="relative">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="banner-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload banner image
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </Label>
                      <Input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
