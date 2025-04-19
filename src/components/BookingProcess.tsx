
import { Button } from "@/components/ui/button";
import { CricketBallIcon, TicketIcon } from "@/components/ui/cricket-icons";
import { 
  CalendarDays, 
  CreditCard, 
  Mail, 
  MapPin, 
  Search, 
  ShieldCheck, 
  TicketCheck
} from "lucide-react";

const BookingProcess = () => {
  const steps = [
    {
      icon: <Search className="text-white" />,
      title: "Find Your Match",
      description: "Browse upcoming IPL matches and select your favorite teams to watch live"
    },
    {
      icon: <MapPin className="text-white" />,
      title: "Choose Seats",
      description: "Select your preferred seating area and view from our interactive stadium map"
    },
    {
      icon: <CreditCard className="text-white" />,
      title: "Secure Payment",
      description: "Make a fast, safe payment with multiple options including UPI and cards"
    },
    {
      icon: <TicketCheck className="text-white" />,
      title: "Get Tickets",
      description: "Receive e-tickets instantly via email or download from your account"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-ipl-softBlue/30 to-white -z-10"></div>
      
      {/* Floating cricket ball decoration */}
      <div className="absolute top-20 left-10 opacity-10 animate-spin-slow">
        <CricketBallIcon className="size-24 text-ipl-purple/60" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 animate-float">
        <CricketBallIcon className="size-16 text-ipl-orange/60" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-2 mb-4">
            <TicketIcon className="text-ipl-purple" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-ipl-orange to-ipl-purple bg-clip-text text-transparent">
              Seamless Booking Process
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl text-center">
            Book your tickets in minutes with our simple four-step booking process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center animate-fade-in" 
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-ipl-purple to-ipl-blue flex items-center justify-center mb-6 shadow-md">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-500">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute mt-8 ml-40">
                  <svg width="50" height="24" viewBox="0 0 50 24" fill="none">
                    <path d="M49.0607 13.0607C49.6464 12.4749 49.6464 11.5251 49.0607 10.9393L39.5147 1.3934C38.9289 0.8076 37.9792 0.8076 37.3934 1.3934C36.8076 1.9792 36.8076 2.9289 37.3934 3.5147L45.8787 12L37.3934 20.4853C36.8076 21.0711 36.8076 22.0208 37.3934 22.6066C37.9792 23.1924 38.9289 23.1924 39.5147 22.6066L49.0607 13.0607ZM0 13.5H48V10.5H0V13.5Z" fill="currentColor" className="text-gray-300" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center mt-16">
          <div className="flex items-center gap-2 mb-6 bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-100">
            <ShieldCheck className="text-green-500" />
            <span className="text-gray-700">Secure transactions with end-to-end encryption</span>
          </div>
          <Button size="lg" className="bg-gradient-to-r from-ipl-purple to-ipl-blue hover:opacity-90 text-white rounded-full px-8 py-6 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
            <TicketIcon className="size-5" />
            <span className="text-lg">Book Your IPL Tickets Now</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BookingProcess;
