
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MatchesSection from "@/components/MatchesSection";
import FeaturesSection from "@/components/FeaturesSection";
import StadiumLocations from "@/components/StadiumLocations";
import BookingProcess from "@/components/BookingProcess";
import Footer from "@/components/Footer";
import { ThemedBookMyShowLogo } from "@/components/ui/cricket-icons";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <Hero />
        <MatchesSection />
        <StadiumLocations />
        <BookingProcess />
        <FeaturesSection />
        
        {/* BookMyShow Partnership Section - Enhanced */}
        <section className="py-12 bg-gradient-to-r from-gray-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-6">Official Ticketing Partner</h2>
            <div className="flex justify-center items-center">
              <a 
                href="https://www.bookmyshow.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-90 transition-opacity"
                aria-label="Book My Show"
              >
                <ThemedBookMyShowLogo className="h-16 w-auto" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
