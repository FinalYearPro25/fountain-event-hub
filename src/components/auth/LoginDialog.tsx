
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Users, Shield, Crown } from "lucide-react";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      onOpenChange(false);
    }, 1500);
  };

  const roleExamples = [
    {
      icon: User,
      title: "Student Login",
      email: "student@fountain.edu.ng",
      badge: "Student",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      icon: Users,
      title: "Staff Login",
      email: "staff@fountain.edu.ng",
      badge: "Staff",
      badgeColor: "bg-green-100 text-green-700"
    },
    {
      icon: Shield,
      title: "Dean Login",
      email: "dean@fountain.edu.ng",
      badge: "Dean",
      badgeColor: "bg-purple-100 text-purple-700"
    },
    {
      icon: Crown,
      title: "Admin Login",
      email: "admin@fountain.edu.ng",
      badge: "Admin",
      badgeColor: "bg-red-100 text-red-700"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to your Fountain Events account
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="demo">Demo Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@fountain.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="text-center">
              <Button variant="link" className="text-sm">
                Forgot your password?
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="demo" className="space-y-4">
            <p className="text-sm text-gray-600 text-center mb-4">
              Try different user roles to explore the system
            </p>
            <div className="grid grid-cols-2 gap-3">
              {roleExamples.map((role, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <role.icon className="h-5 w-5 text-gray-600" />
                      <Badge className={`text-xs ${role.badgeColor}`}>
                        {role.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-sm font-medium mb-1">
                      {role.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {role.email}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
