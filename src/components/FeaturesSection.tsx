
import { Shield, Smartphone, CalendarCheck, CreditCard, Ticket } from "lucide-react";

const features = [
  {
    icon: <Shield className="w-8 h-8 text-ipl-gold" />,
    title: "Secure Booking",
    description: "Your data and payments are protected with advanced encryption and secure gateways."
  },
  {
    icon: <Smartphone className="w-8 h-8 text-ipl-gold" />,
    title: "Mobile Tickets",
    description: "Access your tickets anytime, anywhere with our mobile-friendly e-tickets."
  },
  {
    icon: <CalendarCheck className="w-8 h-8 text-ipl-gold" />,
    title: "Guaranteed Seats",
    description: "Reserved seating with confirmation ensures your spot at the match."
  },
  {
    icon: <CreditCard className="w-8 h-8 text-ipl-gold" />,
    title: "Easy Payments",
    description: "Multiple payment options including UPI, cards, and wallets for hassle-free booking."
  },
  {
    icon: <Ticket className="w-8 h-8 text-ipl-gold" />,
    title: "Special Offers",
    description: "Exclusive discounts for early bookings and loyal customers."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-ipl-blue to-ipl-purple bg-clip-text text-transparent mb-4">Why Choose IPL Book</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide the best cricket ticket booking experience with exclusive features and benefits
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow flex flex-col items-center text-center hover:border-ipl-purple/30 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-3 rounded-full bg-gradient-to-r from-ipl-purple to-ipl-blue mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
