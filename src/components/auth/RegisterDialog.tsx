
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Users, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RegisterDialog = ({ open, onOpenChange }: RegisterDialogProps) => {
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    studentId: "",
    staffId: "",
    college: "",
    department: "",
    yearOfStudy: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const colleges = [
    "College of Arts",
    "College of Natural and Applied Sciences", 
    "College of Basic Medical and Health Sciences",
    "College of Management and Social Sciences",
    "College of Law"
  ];

  // Clear form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setUserType("");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        studentId: "",
        staffId: "",
        college: "",
        department: "",
        yearOfStudy: ""
      });
    }
  }, [open]);

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            phone_number: formData.phone,
            user_type: userType,
            student_id: formData.studentId,
            staff_id: formData.staffId,
            college: formData.college,
            department: formData.department,
            year_of_study: formData.yearOfStudy ? parseInt(formData.yearOfStudy) : null
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please try logging in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account, then you can log in.",
        });
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const userTypes = [
    {
      icon: User,
      title: "Student",
      description: "Current student at Fountain University",
      value: "student",
      badge: "Student",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      icon: Users,
      title: "Staff",
      description: "Faculty or staff member",
      value: "staff",
      badge: "Staff",
      badgeColor: "bg-green-100 text-green-700"
    },
    {
      icon: Building,
      title: "External",
      description: "External organization or visitor",
      value: "outsider",
      badge: "External",
      badgeColor: "bg-orange-100 text-orange-700"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Join Fountain Events</DialogTitle>
          <DialogDescription className="text-center">
            Create your account to start managing campus events
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">I am a...</Label>
            <div className="grid grid-cols-1 gap-3">
              {userTypes.map((type) => (
                <Card 
                  key={type.value}
                  className={`cursor-pointer border-2 transition-all ${
                    userType === type.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                  onClick={() => setUserType(type.value)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <type.icon className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-base">{type.title}</CardTitle>
                      </div>
                      <Badge className={`text-xs ${type.badgeColor}`}>
                        {type.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">
                      {type.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          {userType && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={userType === 'student' ? 'student@fountain.edu.ng' : 'your.email@fountain.edu.ng'}
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  required
                />
              </div>

              {/* Student-specific fields */}
              {userType === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={formData.studentId}
                        onChange={(e) => updateFormData('studentId', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearOfStudy">Year of Study</Label>
                      <Select onValueChange={(value) => updateFormData('yearOfStudy', value)}>
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
                  </div>
                </>
              )}

              {/* Staff-specific fields */}
              {userType === 'staff' && (
                <div className="space-y-2">
                  <Label htmlFor="staffId">Staff ID</Label>
                  <Input
                    id="staffId"
                    value={formData.staffId}
                    onChange={(e) => updateFormData('staffId', e.target.value)}
                    required
                  />
                </div>
              )}

              {/* College and Department for students and staff */}
              {(userType === 'student' || userType === 'staff') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="college">College</Label>
                    <Select onValueChange={(value) => updateFormData('college', value)}>
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
                      placeholder="e.g., Computer Science"
                      value={formData.department}
                      onChange={(e) => updateFormData('department', e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
