
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { VenueSelector } from "./VenueSelector";
import { Upload, Link, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  venue_id: string;
  max_participants: number;
  registration_fee: number;
  banner_image_url: string;
}

export const CreateEventForm = ({ onClose, onEventCreated }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>();

  const watchedVenue = watch("venue_id");
  const watchedStartDate = watch("start_date");
  const watchedEndDate = watch("end_date");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setValue("banner_image_url", ""); // Clear URL field when file is selected
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `event-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create an event.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let bannerImageUrl = data.banner_image_url;

      // Handle image upload if file is selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          bannerImageUrl = uploadedUrl;
        } else {
          toast({
            title: "Image upload failed",
            description: "Failed to upload banner image. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Validate dates
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (startDate >= endDate) {
        toast({
          title: "Invalid dates",
          description: "End date must be after start date.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create event
      const eventData = {
        title: data.title,
        description: data.description,
        event_type: data.event_type as any,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        venue_id: data.venue_id || null,
        max_participants: data.max_participants || null,
        registration_fee: data.registration_fee || 0,
        banner_image_url: bannerImageUrl || null,
        organizer_id: user.id,
        status: 'pending_approval' as any,
      };

      console.log('Creating event with data:', eventData);

      const { data: eventResult, error } = await supabase
        .from("events")
        .insert([eventData])
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        throw error;
      }

      console.log('Event created successfully:', eventResult);

      toast({
        title: "Event created successfully!",
        description: "Your event has been submitted for approval.",
      });

      if (onEventCreated) {
        onEventCreated(eventResult);
      }
      
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error creating event",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStartAndEndTimes = () => {
    if (!watchedStartDate || !watchedEndDate) return { startTime: "", endTime: "" };
    
    const startDate = new Date(watchedStartDate);
    const endDate = new Date(watchedEndDate);
    
    return {
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
    };
  };

  const { startTime, endTime } = getStartAndEndTimes();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="event_type">Event Type *</Label>
              <Select onValueChange={(value) => setValue("event_type", value)}>
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
              {errors.event_type && (
                <p className="text-red-500 text-sm mt-1">Event type is required</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter event description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date & Time *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                {...register("start_date", { required: "Start date is required" })}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">End Date & Time *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                {...register("end_date", { required: "End date is required" })}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                {...register("max_participants", { valueAsNumber: true })}
                placeholder="Enter maximum participants"
              />
            </div>

            <div>
              <Label htmlFor="registration_fee">Registration Fee (₦)</Label>
              <Input
                id="registration_fee"
                type="number"
                step="0.01"
                {...register("registration_fee", { valueAsNumber: true })}
                placeholder="Enter registration fee"
              />
            </div>
          </div>

          {/* Banner Image Section */}
          <div>
            <Label>Event Banner Image</Label>
            <div className="mt-2 space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={uploadMethod === "file" ? "default" : "outline"}
                  onClick={() => setUploadMethod("file")}
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === "url" ? "default" : "outline"}
                  onClick={() => setUploadMethod("url")}
                  size="sm"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Image URL
                </Button>
              </div>

              {uploadMethod === "file" && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image File
                  </Button>
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-600">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {uploadMethod === "url" && (
                <Input
                  {...register("banner_image_url")}
                  placeholder="Enter image URL"
                  onChange={(e) => setPreviewUrl(e.target.value)}
                />
              )}

              {(previewUrl || watch("banner_image_url")) && (
                <div className="mt-2">
                  <img
                    src={previewUrl || watch("banner_image_url")}
                    alt="Preview"
                    className="max-w-xs max-h-32 object-cover rounded border"
                    onError={() => setPreviewUrl("")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Venue Selection */}
          <div>
            <Label>Select Venue</Label>
            <VenueSelector
              selectedDate={watchedStartDate?.split("T")[0]}
              selectedStartTime={startTime}
              selectedEndTime={endTime}
              onSelectVenue={(venueId) => setValue("venue_id", venueId)}
              value={watchedVenue}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
