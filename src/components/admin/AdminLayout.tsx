
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Home, 
  Ticket, 
  LogOut, 
  ChevronRight, 
  Menu, 
  X, 
  BarChart3, 
  User,
  Settings,
  CreditCard,
  Building2
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const navItems = [
  { name: "Dashboard", path: "/admin", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Teams", path: "/admin/teams", icon: <Users className="h-5 w-5" /> },
  { name: "Matches", path: "/admin/matches", icon: <Calendar className="h-5 w-5" /> },
  { name: "Stadiums", path: "/admin/stadiums", icon: <Building2 className="h-5 w-5" /> },
  { name: "Bookings", path: "/admin/bookings", icon: <Ticket className="h-5 w-5" /> },
  { name: "Users", path: "/admin/users", icon: <User className="h-5 w-5" /> },
  { name: "Settings", path: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  { name: "Payment Settings", path: "/admin/payment-settings", icon: <CreditCard className="h-5 w-5" /> },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-6 w-6 text-ipl-blue" />
              <span className="font-bold text-lg">IPL Ticket Admin</span>
            </Link>
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-gray-100",
                      location.pathname === item.path
                        ? "bg-ipl-blue/10 text-ipl-blue font-medium"
                        : "text-gray-600"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {location.pathname === item.path && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div className="ml-2 text-sm truncate">
                  {user?.email || "Admin"}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        {pageTitle && (
          <div className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
            <h1 className="text-xl font-semibold">{pageTitle}</h1>
          </div>
        )}
        <div className="pt-4">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
