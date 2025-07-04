
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Shield, CheckCircle, ArrowRight, Sparkles, Award, BookOpen, TrendingUp } from "lucide-react";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { StatsSection } from "@/components/landing/StatsSection";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { Navigate } from "react-router-dom";

const Index = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-green-light">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-primary font-medium">Loading Fountain Events...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Calendar,
      title: "Smart Event Planning",
      description: "Streamlined event creation with intelligent scheduling and automated conflict detection across all university venues.",
      color: "bg-emerald-500"
    },
    {
      icon: Users,
      title: "Community Engagement",
      description: "Connect students, faculty, and staff through seamless event registration and participation tracking.",
      color: "bg-green-600"
    },
    {
      icon: MapPin,
      title: "Venue Management",
      description: "Comprehensive venue booking system with real-time availability and resource allocation optimization.",
      color: "bg-teal-500"
    },
    {
      icon: Shield,
      title: "Secure Approvals",
      description: "Multi-level approval workflows ensuring proper authorization and maintaining institutional governance.",
      color: "bg-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-green rounded-xl flex items-center justify-center shadow-soft">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Fountain Events
                </h1>
                <p className="text-xs text-green-600 font-medium">Campus Event Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowLogin(true)}
                className="text-gray-700 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setShowRegister(true)}
                className="btn-primary px-6 py-2 rounded-lg font-semibold shadow-soft hover:shadow-green transition-all duration-200"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 gradient-green-light opacity-40"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-15 animate-float" style={{animationDelay: "2s"}}></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm text-green-800 rounded-full text-sm font-semibold mb-8 shadow-soft border border-green-100">
            <Award className="h-4 w-4 mr-2 text-green-600" />
            Advanced Campus Event Management System
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-fade-up">
            <span className="text-balance">Transform Your</span>
            <br />
            <span className="gradient-green bg-clip-text text-transparent">
              Campus Events
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed text-pretty">
            The comprehensive event management platform designed exclusively for Fountain University. 
            From planning to execution, streamline every aspect of your campus events with 
            intelligent automation and seamless collaboration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              onClick={() => setShowRegister(true)}
              className="btn-primary px-10 py-4 text-lg rounded-xl font-semibold shadow-green hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              Start Managing Events
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setShowLogin(true)}
              className="btn-secondary px-10 py-4 text-lg rounded-xl font-semibold transition-all duration-300"
            >
              Sign In to Account
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>University Approved</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
              Everything You Need for 
              <span className="gradient-green bg-clip-text text-transparent"> Campus Events</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-pretty">
              From students to administrators, our platform provides comprehensive tools 
              for efficient event management across all university operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <StatsSection />

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-balance">
            Ready to Transform Your Campus Events?
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto text-pretty">
            Join the Fountain University community in revolutionizing campus event management 
            with our comprehensive, user-friendly platform designed for academic excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              onClick={() => setShowRegister(true)}
              className="bg-white text-green-700 hover:bg-green-50 px-10 py-4 text-lg rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Get Started Today
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => setShowLogin(true)}
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-10 py-4 text-lg rounded-xl font-semibold transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 gradient-green rounded-lg flex items-center justify-center">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">Fountain Events</span>
                  <p className="text-green-400 text-sm">Campus Event Management</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                Comprehensive campus event management system designed specifically for 
                Fountain University's diverse academic community and institutional excellence.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">FU</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-green-400">Quick Links</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Venues</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:translate-x-1 transform duration-200 block">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-green-400">Contact</h3>
              <ul className="space-y-3 text-gray-400">
                <li>Fountain University</li>
                <li>Osogbo, Osun State</li>
                <li>Nigeria</li>
                <li className="text-green-400">events@fountain.edu.ng</li>
                <li>+234 (0) 803 123 4567</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-center md:text-left">
                &copy; 2024 Fountain University. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Support</a>
              </div>
            </div>
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
