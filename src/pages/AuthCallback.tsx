import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Heart } from 'lucide-react';
import HeaderLogo from '@/components/HeaderLogo';

type UserType = 'artist' | 'client';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [userType, setUserType] = useState<UserType>('client');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          toast({
            title: "Authentication Error",
            description: "Failed to complete Google sign-in. Please try again.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (data.session?.user) {
          // Check if user already has a profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();

          if (profile) {
            // User already has profile, redirect to dashboard
            navigate('/dashboard', { replace: true });
          } else {
            // New user, show setup form
            const userData = data.session.user.user_metadata;
            setFirstName(userData.given_name || userData.name?.split(' ')[0] || '');
            setLastName(userData.family_name || userData.name?.split(' ')[1] || '');
            setShowSetup(true);
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    if (!loading) {
      handleAuthCallback();
    }
  }, [loading, navigate, toast]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName) {
      toast({
        title: "Error",
        description: "Please fill in your name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user?.id,
          user_type: userType,
          first_name: firstName,
          last_name: lastName
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome to Make-Up Lounge!",
        description: "Your profile has been created successfully.",
      });
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (!showSetup) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Completing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <HeaderLogo />
          </div>
          <p className="text-white/80">Let's complete your profile setup</p>
        </div>

        <Card className="p-6 bg-white/95 backdrop-blur-sm border-white/30">
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">I am a:</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={userType === 'artist' ? 'default' : 'outline'}
                  onClick={() => setUserType('artist')}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Sparkles className="h-5 w-5 mb-2" />
                  <span className="text-xs">Makeup Artist</span>
                </Button>
                <Button
                  type="button"
                  variant={userType === 'client' ? 'default' : 'outline'}
                  onClick={() => setUserType('client')}
                  className="flex flex-col items-center p-4 h-auto"
                >
                  <Heart className="h-5 w-5 mb-2" />
                  <span className="text-xs">Client</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AuthCallback;