
import { Button } from "@/components/ui/button";
import { CricketBallIcon, CricketBatIcon, TicketIcon } from "@/components/ui/cricket-icons";
import { Calendar, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white to-ipl-softBlue pt-10 pb-20">
      {/* Background decorative elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-ipl-purple/5 animate-float"></div>
      <div className="absolute top-40 left-10 opacity-10 animate-spin-slow">
        <CricketBallIcon className="size-20 text-ipl-purple" />
      </div>
      <div className="absolute bottom-10 right-40 opacity-10 animate-float">
        <CricketBatIcon className="size-32 text-ipl-orange/30 rotate-45" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-scale-in">
              <span className="bg-gradient-to-r from-ipl-blue to-ipl-purple bg-clip-text text-transparent">Book IPL</span>
              <span className="text-gray-900"> Tickets Now</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Experience the electrifying atmosphere of live IPL cricket matches. 
              Book your tickets for the best seats at the best prices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Link to="/matches">
                <Button size="lg" className="bg-gradient-to-r from-ipl-purple to-ipl-blue hover:opacity-90 text-white rounded-full px-8 shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                  <TicketIcon className="size-5" />
                  <span>Book Tickets</span>
                </Button>
              </Link>
              <Link to="/matches">
                <Button size="lg" variant="outline" className="border-ipl-blue text-ipl-blue hover:bg-ipl-blue/5 rounded-full px-8">
                  View Matches
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap gap-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-ipl-softPurple flex items-center justify-center">
                  <Calendar className="size-5 text-ipl-purple" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">All Season</div>
                  <div className="text-gray-500">Matches</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-ipl-softOrange flex items-center justify-center">
                  <MapPin className="size-5 text-ipl-orange" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Multiple</div>
                  <div className="text-gray-500">Stadiums</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-ipl-softBlue flex items-center justify-center">
                  <Shield className="size-5 text-ipl-blue" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Secure</div>
                  <div className="text-gray-500">Booking</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1605&auto=format&fit=crop" 
                alt="IPL Stadium Atmosphere" 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Next Match</h3>
                    <p className="text-sm text-gray-600">Mumbai vs Chennai</p>
                  </div>
                  <Link to="/matches">
                    <Button className="bg-ipl-orange hover:bg-orange-500 text-white rounded-full px-4 py-1 text-sm">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-lg w-32 animate-float">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-500">Starting at</div>
                <div className="text-2xl font-bold text-ipl-blue">₹999</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
