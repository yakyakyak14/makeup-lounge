import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Users, Calendar, Star, Heart, ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import HeaderLogo from "@/components/HeaderLogo";
import ThemeToggle from "@/components/ThemeToggle";
// Using public placeholder images to avoid missing asset issues

type UserType = "artist" | "client" | null;

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, loading } = useAuth();
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);

  useEffect(() => {
    // Reset selected user type when component mounts
    setSelectedUserType(null);
  }, []);

  const handleUserTypeSelect = (type: UserType) => {
    if (user) {
      // If user is already logged in, show a message
      toast({
        title: "Already signed in",
        description: "You are already signed in. Please sign out to create a new account.",
      });
      return;
    }
    
    // Navigate to auth page with user type
    navigate('/auth', { state: { userType: type } });
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      setSelectedUserType(null);
    }
  };

  const features = [
    {
      icon: Users,
      title: "Professional Artists",
      description: "Connect with certified makeup artists in your area"
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Book appointments that fit your schedule"
    },
    {
      icon: Star,
      title: "Quality Reviews",
      description: "Real reviews from verified clients"
    },
    {
      icon: Sparkles,
      title: "Premium Services",
      description: "Wedding, events, photoshoots and more"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={import.meta.env.BASE_URL + "placeholder.svg"}
            alt="Professional makeup artist at work" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="mb-8">
            <HeaderLogo />
          </div>
          {/* Top-right controls: Theme toggle (always) + auth status (if signed in) */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <span className="text-white text-sm">Welcome back, {user.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-up">
              <h1 className="text-5xl md:text-7xl font-playfair font-bold text-white mb-6 leading-tight">
                Make-Up <span className="text-gradient bg-gradient-to-r from-pink-200 to-white bg-clip-text text-transparent">Lounge</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                Where Beauty Professionals Meet Their Perfect Clients
              </p>
            </div>
            
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
                Join Nigeria's premier platform connecting talented makeup artists with clients seeking exceptional beauty services.
              </p>
            </div>

            {/* User Type Selection or Auth Options */}
            {!user ? (
              <div className="animate-fade-up grid md:grid-cols-2 gap-6 max-w-2xl mx-auto" style={{ animationDelay: "0.4s" }}>
                <Card 
                  className="p-8 hover-lift cursor-pointer border-white/20 bg-white/10 backdrop-blur-sm text-white group"
                  onClick={() => handleUserTypeSelect("artist")}
                >
                  <div className="text-center">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-pink-200 group-hover:animate-glow" />
                    <h3 className="text-xl font-playfair font-semibold mb-2">I'm a Makeup Artist</h3>
                    <p className="text-white/80 mb-4">Showcase your talent and grow your business</p>
                    <Button variant="elegant" size="lg" className="w-full group-hover:scale-105">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>

                <Card 
                  className="p-8 hover-lift cursor-pointer border-white/20 bg-white/10 backdrop-blur-sm text-white group"
                  onClick={() => handleUserTypeSelect("client")}
                >
                  <div className="text-center">
                    <Heart className="mx-auto mb-4 h-12 w-12 text-pink-200 group-hover:animate-glow" />
                    <h3 className="text-xl font-playfair font-semibold mb-2">I Need Makeup Services</h3>
                    <p className="text-white/80 mb-4">Find the perfect artist for your special occasion</p>
                    <Button variant="elegant" size="lg" className="w-full group-hover:scale-105">
                      Find Artists <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="animate-fade-up max-w-md mx-auto">
                <Card className="p-8 bg-white/95 backdrop-blur-sm border-white/30">
                  <h3 className="text-2xl font-playfair font-semibold text-primary mb-4">
                    Welcome back!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You are signed in and ready to explore Make-Up Lounge.
                  </p>
                  <div className="space-y-3">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate('/dashboard')}
                    >
                      Explore Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate('/profile')}
                    >
                      View Profile
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Sign In Link for non-authenticated users */}
            {!user && (
              <div className="mt-8 text-center">
                <p className="text-white/80 mb-4">Already have an account?</p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gradient mb-4">
              Why Choose Make-Up Lounge?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of professionalism, convenience, and beauty excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover-lift group border-primary/10">
                <feature.icon className="mx-auto mb-4 h-12 w-12 text-primary group-hover:text-coral transition-colors" />
                <h3 className="text-xl font-semibold mb-3 font-playfair">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={import.meta.env.BASE_URL + "placeholder.svg"}
                alt="Beautiful client experience" 
                className="rounded-2xl shadow-elegant hover-lift"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-primary mb-6">
                Luxury Beauty Experience
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                From bridal makeup to photoshoots, our certified artists deliver exceptional results that make you feel confident and beautiful.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-coral" />
                  <span>Verified professional artists</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-coral" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-coral" />
                  <span>Satisfaction guaranteed</span>
                </div>
              </div>
              <Button
                variant="hero"
                size="xl"
                onClick={() => navigate('/browse')}
              >
                Start Your Beauty Journey
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-playfair font-semibold mb-4">Make-Up Lounge</h3>
          <p className="text-primary-glow mb-6">Connecting beauty professionals with their perfect clients</p>
          <p className="text-sm text-primary-glow">© 2024 Make-Up Lounge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;