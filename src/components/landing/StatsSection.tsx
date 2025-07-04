
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, TrendingUp } from "lucide-react";

export const StatsSection = () => {
  const stats = [
    { 
      number: "500+", 
      label: "Events Organized", 
      description: "Successful campus events",
      icon: Calendar,
      color: "text-green-600"
    },
    { 
      number: "11", 
      label: "Venues Available", 
      description: "Across all colleges",
      icon: MapPin,
      color: "text-emerald-600"
    },
    { 
      number: "2,000+", 
      label: "Active Users", 
      description: "Students, staff, and faculty",
      icon: Users,
      color: "text-teal-600"
    },
    { 
      number: "98%", 
      label: "Success Rate", 
      description: "Streamlined processes",
      icon: TrendingUp,
      color: "text-green-700"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-green-50/50 to-emerald-50/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/40"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-15"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
            Trusted by the 
            <span className="gradient-green bg-clip-text text-transparent"> Fountain Community</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto text-pretty">
            Real numbers that showcase our impact on campus event management and community engagement.
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="group text-center border-0 shadow-soft bg-white/90 backdrop-blur-sm hover:shadow-green transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardContent className="pt-8 pb-6 relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                
                <div className="text-4xl md:text-5xl font-bold gradient-green bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {stat.description}
                </div>
              </CardContent>
              
              {/* Decorative border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
