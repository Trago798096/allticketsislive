
import { Card } from "@/components/ui/card";
import { StadiumIcon } from "@/components/ui/cricket-icons";
import { MapPin } from "lucide-react";

const stadiums = [
  {
    name: "M.A. Chidambaram Stadium",
    location: "Chennai",
    capacity: "50,000",
    image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1024&auto=format&fit=crop"
  },
  {
    name: "Wankhede Stadium",
    location: "Mumbai",
    capacity: "33,108",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1024&auto=format&fit=crop"
  },
  {
    name: "Eden Gardens",
    location: "Kolkata",
    capacity: "66,000",
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1024&auto=format&fit=crop"
  },
  {
    name: "M. Chinnaswamy Stadium",
    location: "Bangalore",
    capacity: "40,000",
    image: "https://images.unsplash.com/photo-1518019671582-55004f1bc9ad?q=80&w=1024&auto=format&fit=crop"
  }
];

const StadiumLocations = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-white to-ipl-softPurple/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 mb-4">
            <StadiumIcon className="text-ipl-purple" />
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-ipl-blue to-ipl-purple bg-clip-text text-transparent">
              Stadium Locations
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl text-center">
            Experience the electrifying atmosphere of IPL matches across these iconic venues in India
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stadiums.map((stadium, index) => (
            <Card 
              key={index} 
              className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={stadium.image} 
                  alt={stadium.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                  <h3 className="text-white font-semibold text-lg">{stadium.name}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={16} />
                  <span>{stadium.location}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Capacity: {stadium.capacity} seats
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StadiumLocations;
