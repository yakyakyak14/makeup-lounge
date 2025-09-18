import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Ratings from "./pages/Ratings";
import Services from "./pages/Services";
import Browse from "./pages/Browse";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import SplashScreen from "@/components/SplashScreen";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const RouterWithSplash = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Initial splash on app load
    const t = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Splash on every route change
    setShowSplash(true);
    const t = setTimeout(() => setShowSplash(false), 700);
    return () => clearTimeout(t);
  }, [location.key]);

  useEffect(() => {
    // Show splash when user comes back to the app (tab visible again)
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        setShowSplash(true);
        const t = setTimeout(() => setShowSplash(false), 800);
        // @ts-ignore attach for cleanup
        onVis._t && clearTimeout(onVis._t);
        // @ts-ignore store timer id
        onVis._t = t;
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      // @ts-ignore cleanup timer
      onVis._t && clearTimeout(onVis._t);
    };
  }, []);

  return (
    <>
      {showSplash && <SplashScreen />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ratings" element={<Ratings />} />
        <Route path="/services" element={<Services />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/help" element={<Help />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.MODE === 'production' ? '/makeup-lounge' : '/'}>
          <RouterWithSplash />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
