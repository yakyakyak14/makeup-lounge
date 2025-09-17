import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Star, Users, Sparkles, Heart, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageRating: number;
}

interface Profile {
  user_type: string;
  first_name: string;
  last_name: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchRecentBookings();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_type, first_name, last_name')
      .eq('user_id', user?.id)
      .single();
    
    setProfile(data);
  };

  const fetchStats = async () => {
    if (!user) return;
    
    const isArtist = profile?.user_type === 'artist';
    const userField = isArtist ? 'artist_id' : 'client_id';
    
    // Get bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq(userField, user.id);

    // Get ratings for artists
    let avgRating = 0;
    if (isArtist && bookings) {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('artist_id', user.id);
      
      if (ratings && ratings.length > 0) {
        avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      }
    }

    const totalRevenue = bookings?.reduce((sum, booking) => 
      sum + Number(booking.negotiated_price || booking.original_price), 0) || 0;

    setStats({
      totalBookings: bookings?.length || 0,
      pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
      totalRevenue,
      averageRating: avgRating
    });
  };

  const fetchRecentBookings = async () => {
    if (!user || !profile) return;
    
    const isArtist = profile.user_type === 'artist';
    const userField = isArtist ? 'artist_id' : 'client_id';
    
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(service_name, service_type),
        client_profile:profiles!bookings_client_id_fkey(first_name, last_name),
        artist_profile:profiles!bookings_artist_id_fkey(first_name, last_name)
      `)
      .eq(userField, user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    setRecentBookings(data || []);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      case 'completed': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const isArtist = profile?.user_type === 'artist';
  const userName = profile ? `${profile.first_name} ${profile.last_name}` : user?.email?.split('@')[0];

  const quickActions = isArtist ? [
    { label: "Manage Services", icon: Sparkles, action: () => navigate('/services') },
    { label: "View Bookings", icon: Calendar, action: () => navigate('/bookings') },
    { label: "Check Ratings", icon: Star, action: () => navigate('/ratings') }
  ] : [
    { label: "Browse Artists", icon: Users, action: () => navigate('/browse') },
    { label: "My Bookings", icon: Calendar, action: () => navigate('/bookings') },
    { label: "Leave Reviews", icon: Heart, action: () => navigate('/ratings') }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-primary rounded-xl p-6 text-white">
          <h1 className="text-3xl font-playfair font-bold mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-primary-glow">
            {isArtist 
              ? "Ready to create beautiful looks today?" 
              : "Ready to find your perfect makeup artist?"
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {isArtist ? "Services provided" : "Bookings made"}
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>

          {isArtist && (
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">₦{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total earnings</p>
              </CardContent>
            </Card>
          )}

          {isArtist && (
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.averageRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Average rating</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No bookings yet</p>
                  <p className="text-sm">
                    {isArtist ? "Wait for clients to book your services" : "Start by browsing artists"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{booking.service?.service_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {isArtist 
                            ? `Client: ${booking.client_profile?.first_name} ${booking.client_profile?.last_name}`
                            : `Artist: ${booking.artist_profile?.first_name} ${booking.artist_profile?.last_name}`
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <p className="text-sm font-medium mt-1">
                          ₦{(booking.negotiated_price || booking.original_price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={action.action}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;