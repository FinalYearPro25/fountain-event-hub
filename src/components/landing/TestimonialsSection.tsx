
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Dean, College of Engineering",
      avatar: "SJ",
      quote: "The approval workflow has cut our event planning time by 60%. It's revolutionary for campus management."
    },
    {
      name: "Michael Chen",
      role: "Student Union President",
      avatar: "MC",
      quote: "Finally, a system that understands student needs. Booking venues and resources is now seamless."
    },
    {
      name: "Prof. Adebayo Oladimeji",
      role: "Vice-Chancellor Office",
      avatar: "AO",
      quote: "The analytics and reporting features give us unprecedented insights into campus event trends."
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Campus Leaders
          </h2>
          <p className="text-xl text-gray-600">
            See what our users say about transforming their event management
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
