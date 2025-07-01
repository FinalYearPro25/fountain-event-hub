import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ProfileEditModal = ({ open, onOpenChange, profile }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    college: "",
    department: "",
    yearOfStudy: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const colleges = [
    "College of Arts",
    "College of Natural and Applied Sciences",
    "College of Basic Medical and Health Sciences",
    "College of Management and Social Sciences",
    "College of Law",
  ];

  useEffect(() => {
    if (profile && open) {
      setFormData({
        fullName: profile.full_name || "",
        phone: profile.phone_number || "",
        college: profile.college_id || "",
        department: profile.department || "",
        yearOfStudy: profile.year_of_study ? String(profile.year_of_study) : "",
      });
    }
  }, [profile, open]);

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          phone_number: formData.phone,
          college_id: formData.college,
          department: formData.department,
          year_of_study: formData.yearOfStudy
            ? parseInt(formData.yearOfStudy)
            : null,
        })
        .eq("id", profile.id);
      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated.",
        });
        onOpenChange(false);
      }
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => updateFormData("fullName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => updateFormData("phone", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <Select
              value={formData.college}
              onValueChange={(value) => updateFormData("college", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your college" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((college) => (
                  <SelectItem key={college} value={college}>
                    {college}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => updateFormData("department", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearOfStudy">Year of Study</Label>
            <Select
              value={formData.yearOfStudy}
              onValueChange={(value) => updateFormData("yearOfStudy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
                <SelectItem value="5">5th Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
