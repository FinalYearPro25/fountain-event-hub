
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export const FeatureCard = ({ icon: Icon, title, description, color }: FeatureCardProps) => {
  return (
    <Card className="group border-0 shadow-soft hover:shadow-green transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardHeader className="relative z-10">
        <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-soft`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <CardTitle className="text-xl font-bold group-hover:text-green-700 transition-colors duration-300 text-balance">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <CardDescription className="text-base leading-relaxed text-gray-600 group-hover:text-gray-700 transition-colors duration-300 text-pretty">
          {description}
        </CardDescription>
      </CardContent>
      
      {/* Decorative element */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full opacity-20 transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
    </Card>
  );
};
