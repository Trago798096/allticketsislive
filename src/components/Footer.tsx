import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
const Footer = () => {
  return <footer className="bg-ipl-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-6">
              <span className="font-bold text-2xl text-ipl-gold">IPL</span>
              <span className="font-bold text-2xl">Book</span>
            </div>
            <p className="text-gray-300 mb-6">
              Best platform for IPL cricket betting with instant payouts and excellent customer support.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-ipl-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-ipl-gold transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-ipl-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-ipl-gold transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">Live Betting</a></li>
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">Results</a></li>
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">Contact Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">Responsible Gambling</a></li>
              <li><a href="#" className="text-gray-300 hover:text-ipl-gold transition-colors">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: support@iplbook.co.in</li>
              <li></li>
              <li>24/7 Customer Support</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-400">
          <p>© 2023 IPL Book. All rights reserved.</p>
          <p className="mt-2">This website is for demonstration purposes only. Must be 18+ to gamble. Please gamble responsibly.</p>
        </div>
      </div>
    </footer>;
};
export default Footer;