
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, CheckCircle, MapPin, CreditCard } from "lucide-react";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { StatsSection } from "@/components/landing/StatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "Smart Event Management",
      description: "Create, manage, and track events with intelligent scheduling and conflict detection",
      color: "bg-blue-500"
    },
    {
      icon: Users,
      title: "Role-Based Access Control",
      description: "Multi-level approval workflows for students, staff, deans, and senate members",
      color: "bg-green-500"
    },
    {
      icon: MapPin,
      title: "Venue Management",
      description: "Real-time venue booking with capacity management and availability tracking",
      color: "bg-purple-500"
    },
    {
      icon: CheckCircle,
      title: "Automated Approvals",
      description: "Streamlined approval process with notifications and deadline tracking",
      color: "bg-orange-500"
    },
    {
      icon: Clock,
      title: "Resource Booking",
      description: "Book audio-visual equipment, furniture, and other resources seamlessly",
      color: "bg-indigo-500"
    },
    {
      icon: CreditCard,
      title: "Integrated Payments",
      description: "Secure payment processing for external bookings and event fees",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Fountain Events</h1>
              <p className="text-xs text-gray-600">Campus Event Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => setShowLogin(true)}>
              Login
            </Button>
            <Button onClick={() => setShowRegister(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
            Fountain University - Campus Events
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Streamline Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Campus Events</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive event management system designed for Fountain University. 
            Manage venues, resources, approvals, and registrations all in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowRegister(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-3 text-lg"
            >
              Start Planning Events
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Campus Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From simple department meetings to large-scale university conferences, 
              our platform handles every aspect of event management.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to organize successful events
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Event", description: "Fill out event details and requirements" },
              { step: "02", title: "Book Venue", description: "Select and reserve your perfect venue" },
              { step: "03", title: "Get Approval", description: "Automated routing through approval hierarchy" },
              { step: "04", title: "Manage & Execute", description: "Track registrations and manage your event" }
            ].map((item, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Campus Events?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join Fountain University in creating memorable, well-organized events.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setShowRegister(true)}
            className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold">Fountain Events</span>
              </div>
              <p className="text-gray-400">
                Empowering Fountain University with seamless event management.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Event Management</li>
                <li>Venue Booking</li>
                <li>Resource Management</li>
                <li>Approval Workflows</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Support</li>
                <li>Training</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>events@fountain.edu.ng</li>
                <li>+234 (0) 123 456 7890</li>
                <li>Fountain University</li>
                <li>Osogbo, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Fountain University. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      <RegisterDialog open={showRegister} onOpenChange={setShowRegister} />
    </div>
  );
};

export default Index;
