
import { Card, CardContent } from "@/components/ui/card";

export const StatsSection = () => {
  const stats = [
    { number: "500+", label: "Events Organized", description: "Successful campus events" },
    { number: "15", label: "Venues Available", description: "Across all colleges" },
    { number: "2,000+", label: "Active Users", description: "Students, staff, and faculty" },
    { number: "98%", label: "Approval Rate", description: "Streamlined processes" }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
