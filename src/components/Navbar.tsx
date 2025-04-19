import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, User, LogOut, Ticket, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/components/Logo";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Matches", path: "/matches" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`
    : user?.email?.split('@')[0] || 'User';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen
          ? "bg-white shadow-md py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Logo size={isMobile ? "md" : "lg"} className="hover:opacity-90 transition-opacity" />

        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium hover:text-ipl-blue transition-colors ${
                    location.pathname === link.path
                      ? "text-ipl-blue"
                      : "text-gray-700"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User size={18} className="text-ipl-blue" />
                      <span className="max-w-[120px] truncate">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link to="/profile" className="w-full">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/profile?tab=bookings" className="w-full">
                      <DropdownMenuItem className="cursor-pointer">
                        <Ticket className="mr-2 h-4 w-4" />
                        <span>My Bookings</span>
                      </DropdownMenuItem>
                    </Link>
                    
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <Link to="/admin" className="w-full">
                          <DropdownMenuItem className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link to="/admin/settings" className="w-full">
                          <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Site Settings</span>
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-gradient-to-r from-ipl-blue to-ipl-purple hover:opacity-90 shadow-sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Button */}
        {isMobile && (
          <button
            className="p-2 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={24} className="text-gray-800" />
            ) : (
              <Menu size={24} className="text-gray-800" />
            )}
          </button>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isMobile && isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium py-2 px-4 rounded-md hover:bg-gray-100 ${
                  location.pathname === link.path
                    ? "text-ipl-blue bg-blue-50"
                    : "text-gray-700"
                }`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="pt-2 border-t border-gray-200">
                  <div className="px-4 py-2 text-sm font-medium text-gray-500">Account</div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 font-medium py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700"
                    onClick={closeMenu}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/profile?tab=bookings"
                    className="flex items-center gap-2 font-medium py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700"
                    onClick={closeMenu}
                  >
                    <Ticket size={16} />
                    <span>My Bookings</span>
                  </Link>
                  
                  {isAdmin && (
                    <>
                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <div className="px-4 py-2 text-sm font-medium text-gray-500">Admin</div>
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 font-medium py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700"
                          onClick={closeMenu}
                        >
                          <LayoutDashboard size={16} />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/admin/settings"
                          className="flex items-center gap-2 font-medium py-2 px-4 rounded-md hover:bg-gray-100 text-gray-700"
                          onClick={closeMenu}
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>
                      </div>
                    </>
                  )}
                  
                  <button
                    className="flex items-center gap-2 w-full text-left font-medium py-2 px-4 rounded-md hover:bg-gray-100 text-red-600 mt-2"
                    onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-ipl-blue to-ipl-purple hover:opacity-90 text-white font-medium py-2 px-4 rounded-md text-center"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
