import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Heart, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import HeaderLogo from '@/components/HeaderLogo';
import ThemeToggle from '@/components/ThemeToggle';

type UserType = 'artist' | 'client';
type AuthMode = 'signin' | 'signup';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { signUp, signIn, signInWithGoogle, user, loading } = useAuth();
  
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [userType, setUserType] = useState<UserType>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Redirect if already authenticated
    if (user && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Get user type from location state if redirected from Index page
    const state = location.state as { userType?: UserType };
    if (state?.userType) {
      setUserType(state.userType);
      setAuthMode('signup');
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    if (authMode === 'signup') {
      if (!formData.firstName || !formData.lastName) {
        toast({
          title: "Error",
          description: "Please fill in your name",
          variant: "destructive",
        });
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords don't match",
          variant: "destructive",
        });
        return false;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let result;
      
      if (authMode === 'signup') {
        result = await signUp(formData.email, formData.password, userType, formData.firstName, formData.lastName);
        
        if (!result.error) {
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account.",
          });
        }
      } else {
        result = await signIn(formData.email, formData.password);
        
        if (!result.error) {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
          navigate('/dashboard', { replace: true });
        }
      }

      if (result.error) {
        let errorMessage = "An error occurred. Please try again.";
        
        if (result.error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (result.error.message.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (result.error.message.includes('Email not confirmed')) {
          errorMessage = "Please verify your email address before signing in.";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex justify-center">
            <HeaderLogo />
          </div>
          <p className="text-center text-white/80 mt-2">
            {authMode === 'signin' ? 'Welcome back!' : 'Join our community'}
          </p>
        </div>

        <Card className="p-6 bg-white/95 backdrop-blur-sm border-white/30">
          {/* User Type Selection for Signup */}
          {authMode === 'signup' && (
            <div className="mb-6">
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
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-muted"></div>
            <span className="mx-4 text-sm text-muted-foreground">or</span>
            <div className="flex-1 border-t border-muted"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setFormData({
                  email: '',
                  password: '',
                  firstName: '',
                  lastName: '',
                  confirmPassword: ''
                });
              }}
              className="text-sm text-primary hover:underline"
            >
              {authMode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;