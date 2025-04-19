
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from "./components/ui/theme-provider";
import Index from './pages/Index';
import AuthPage from './pages/AuthPage';
import MatchesPage from './pages/MatchesPage';
import MatchDetailPage from './pages/MatchDetailPage';
import BookingPage from './pages/BookingPage';
import SeatingPage from './pages/SeatingPage';
import PaymentPage from './pages/PaymentPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/admin/AdminPanel';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMatches from './pages/admin/AdminMatches';
import AdminStadiums from './pages/admin/AdminStadiums';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminNews from './pages/admin/AdminNews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSeatCategories from './pages/admin/AdminSeatCategories';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import RedirectHandler from './components/utils/RedirectHandler';
import AdminPaymentSettings from './pages/admin/AdminPaymentSettings';

function App() {
  const theme = "system";

  return (
    <ThemeProvider defaultTheme={theme} storageKey="vite-react-theme">
      <AuthProvider>
        <RedirectHandler />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/match/:id" element={<MatchDetailPage />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/seating/:id" element={<SeatingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route element={<AdminRoute><Outlet /></AdminRoute>}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/matches" element={<AdminMatches />} />
            <Route path="/admin/stadiums" element={<AdminStadiums />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/teams" element={<AdminTeams />} />
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/seat-categories" element={<AdminSeatCategories />} />
            <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
