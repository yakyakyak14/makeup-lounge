import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import HeaderLogo from "@/components/HeaderLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-elegant">
        <div className="flex justify-center mb-4">
          <HeaderLogo />
        </div>
        <h1 className="mb-2 text-4xl font-bold text-primary">404</h1>
        <p className="mb-6 text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
