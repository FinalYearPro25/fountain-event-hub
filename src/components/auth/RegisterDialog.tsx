import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [userRole, setUserRole] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    studentId: "",
    staffId: "",
    college: "",
    department: "",
    yearOfStudy: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { toast } = useToast();

  const colleges = [
    "College of Arts",
    "College of Natural and Applied Sciences",
    "College of Basic Medical and Health Sciences",
    "College of Management and Social Sciences",
    "College of Law",
  ];

  const roles = [
    { value: "student", label: "Student", userTypes: ["student"] },
    { value: "staff", label: "Staff Member", userTypes: ["staff"] },
    { value: "event_coordinator", label: "Event Coordinator", userTypes: ["staff"] },
    { value: "department_head", label: "Department Head", userTypes: ["staff"] },
    { value: "dean", label: "Dean", userTypes: ["staff"] },
    { value: "senate_member", label: "Senate Member", userTypes: ["staff"] },
    { value: "super_admin", label: "Super Admin", userTypes: ["staff"] },
    { value: "outsider", label: "External/Guest", userTypes: ["outsider"] }
  ];

  useEffect(() => {
    if (!open) {
      setUserType("");
      setUserRole("");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        studentId: "",
        staffId: "",
        college: "",
        department: "",
        yearOfStudy: "",
      });
      setStep(1);
      setRegistrationSuccess(false);
    }
  }, [open]);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (err) {}
      
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
            year_of_study: formData.yearOfStudy
              ? parseInt(formData.yearOfStudy)
              : null,
          },
        },
      });
      
      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Account Already Exists",
            description:
              "An account with this email already exists. Please try logging in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else if (data.user) {
        // After successful registration, add the user role to the user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: userRole
          });

        if (roleError) {
          console.error('Error assigning role:', roleError);
          toast({
            title: "Registration Warning",
            description: "Account created but role assignment failed. Please contact support.",
            variant: "destructive",
          });
        }

        setRegistrationSuccess(true);
        toast({
          title: "Registration Successful!",
          description: `Account created with role: ${roles.find(r => r.value === userRole)?.label}. Please check your email to verify your account.`,
        });
        setStep(4);
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const userTypes = [
    {
      icon: User,
      title: "Student",
      description: "Current student at Fountain University",
      value: "student",
      badge: "Student",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      icon: Users,
      title: "Staff",
      description: "Faculty or staff member",
      value: "staff",
      badge: "Staff",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      icon: Building,
      title: "External",
      description: "External organization or visitor",
      value: "outsider",
      badge: "External",
      badgeColor: "bg-orange-100 text-orange-700",
    },
  ];

  const getAvailableRoles = () => {
    return roles.filter(role => role.userTypes.includes(userType));
  };

  // Step 1: User Type Selection
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-medium">I am a...</Label>
        <div className="grid grid-cols-1 gap-3">
          {userTypes.map((type) => (
            <Card
              key={type.value}
              className={`cursor-pointer border-2 transition-all ${
                userType === type.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              }`}
              onClick={() => {
                setUserType(type.value);
                setStep(2);
              }}
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
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  // Step 2: Role Selection
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base font-medium">Select your role:</Label>
        <Select onValueChange={(value) => setUserRole(value)} required>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {getAvailableRoles().map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" type="button" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button 
          type="button" 
          onClick={() => setStep(3)}
          disabled={!userRole}
        >
          Next
        </Button>
      </div>
    </div>
  );

  // Step 3: Account Details
  const renderStep3 = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setStep(4);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
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
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder={
            userType === "student"
              ? "student@fountain.edu.ng"
              : "your.email@fountain.edu.ng"
          }
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => updateFormData("password", e.target.value)}
          required
        />
      </div>

      {/* Student-specific fields */}
      {userType === "student" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => updateFormData("studentId", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearOfStudy">Year of Study</Label>
            <Select
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
        </div>
      )}

      {/* Staff-specific fields */}
      {userType === "staff" && (
        <div className="space-y-2">
          <Label htmlFor="staffId">Staff ID</Label>
          <Input
            id="staffId"
            value={formData.staffId}
            onChange={(e) => updateFormData("staffId", e.target.value)}
            required
          />
        </div>
      )}

      {/* College and Department for students and staff */}
      {(userType === "student" || userType === "staff") && (
        <>
          <div className="space-y-2">
            <Label htmlFor="college">College</Label>
            <Select onValueChange={(value) => updateFormData("college", value)}>
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
              onChange={(e) => updateFormData("department", e.target.value)}
            />
          </div>
        </>
      )}

      <div className="flex justify-between">
        <Button variant="outline" type="button" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );

  // Step 4: Confirmation & Submit
  const renderStep4 = () =>
    registrationSuccess ? (
      <div className="space-y-6 text-center">
        <h2 className="text-xl font-bold">Registration Successful!</h2>
        <p className="text-gray-600">
          Your account has been created with the role: <strong>{roles.find(r => r.value === userRole)?.label}</strong>
        </p>
        <p className="text-gray-600">
          Please check your email to verify your account, then you can log in.
        </p>
        <Button className="mt-4" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </div>
    ) : (
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Confirm Your Details</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              <b>User Type:</b> {userType}
            </li>
            <li>
              <b>Role:</b> {roles.find(r => r.value === userRole)?.label}
            </li>
            <li>
              <b>Full Name:</b> {formData.fullName}
            </li>
            <li>
              <b>Phone:</b> {formData.phone}
            </li>
            <li>
              <b>Email:</b> {formData.email}
            </li>
            {userType === "student" && (
              <>
                <li>
                  <b>Student ID:</b> {formData.studentId}
                </li>
                <li>
                  <b>Year of Study:</b> {formData.yearOfStudy}
                </li>
              </>
            )}
            {userType === "staff" && (
              <li>
                <b>Staff ID:</b> {formData.staffId}
              </li>
            )}
            {(userType === "student" || userType === "staff") && (
              <>
                <li>
                  <b>College:</b> {formData.college}
                </li>
                <li>
                  <b>Department:</b> {formData.department}
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => setStep(3)}>
            Back
          </Button>
          <Button type="submit" className="w-32" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      </form>
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Join Fountain Events
          </DialogTitle>
          <DialogDescription className="text-center">
            Create your account to start managing campus events
          </DialogDescription>
        </DialogHeader>
        {/* Stepper UI */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full ${step === s ? "bg-blue-600" : "bg-gray-200"}`}
            ></div>
          ))}
        </div>
        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </DialogContent>
    </Dialog>
  );
};
