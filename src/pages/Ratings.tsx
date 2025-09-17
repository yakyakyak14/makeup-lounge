import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageCircle, Gift, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface Rating {
  id: string;
  rating: number;
  comment?: string;
  tip_amount?: number;
  created_at: string;
  booking: {
    id: string;
    booking_date: string;
    service: {
      service_name: string;
      service_type: string;
    };
  };
  client_profile: {
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
  };
  artist_profile: {
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
  };
}

interface CompletedBooking {
  id: string;
  booking_date: string;
  service: {
    service_name: string;
    service_type: string;
  };
  artist_profile: {
    first_name: string;
    last_name: string;
  };
}

interface Profile {
  user_type: string;
}

const Ratings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<CompletedBooking | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchRatings();
      if (profile.user_type === 'client') {
        fetchCompletedBookings();
      }
    }
  }, [profile]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('user_id', user?.id)
      .single();
    
    setProfile(data);
  };

  const fetchRatings = async () => {
    if (!user || !profile) return;
    
    const isArtist = profile.user_type === 'artist';
    const field = isArtist ? 'artist_id' : 'client_id';
    
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        booking:bookings!ratings_booking_id_fkey(
          id,
          booking_date,
          service:services(service_name, service_type)
        ),
        client_profile:profiles!ratings_client_id_fkey(first_name, last_name, profile_picture_url),
        artist_profile:profiles!ratings_artist_id_fkey(first_name, last_name, profile_picture_url)
      `)
      .eq(field, user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setRatings(data);
    }
  };

  const fetchCompletedBookings = async () => {
    if (!user) return;

    // Get completed bookings that haven't been rated yet
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        service:services(service_name, service_type),
        artist_profile:profiles!bookings_artist_id_fkey(first_name, last_name)
      `)
      .eq('client_id', user.id)
      .eq('status', 'completed');

    if (bookings) {
      // Filter out bookings that already have ratings
      const existingRatingBookingIds = ratings.map(r => r.booking.id);
      const unratedBookings = bookings.filter(b => !existingRatingBookingIds.includes(b.id));
      setCompletedBookings(unratedBookings);
    }
  };

  const submitRating = async () => {
    if (!selectedBooking || newRating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    const ratingData = {
      booking_id: selectedBooking.id,
      client_id: user?.id,
      artist_id: selectedBooking.artist_profile ? null : user?.id, // This needs proper artist_id from booking
      rating: newRating,
      comment: newComment || null,
      tip_amount: tipAmount ? Number(tipAmount) : null
    };

    // Get the actual artist_id from the booking
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('artist_id')
      .eq('id', selectedBooking.id)
      .single();

    if (bookingData) {
      ratingData.artist_id = bookingData.artist_id;
    }

    const { error } = await supabase
      .from('ratings')
      .insert(ratingData);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Rating submitted successfully!",
      });
      
      // Reset form
      setSelectedBooking(null);
      setNewRating(0);
      setNewComment("");
      setTipAmount("");
      
      // Refresh data
      fetchRatings();
      fetchCompletedBookings();
    }
  };

  const renderStars = (rating: number, interactive = false, size = "w-5 h-5") => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} cursor-${interactive ? 'pointer' : 'default'} ${
          i < (interactive ? (hoveredStar || rating) : rating)
            ? 'fill-coral text-coral'
            : 'text-gray-300'
        }`}
        onMouseEnter={() => interactive && setHoveredStar(i + 1)}
        onMouseLeave={() => interactive && setHoveredStar(0)}
        onClick={() => interactive && setNewRating(i + 1)}
      />
    ));
  };

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const isArtist = profile?.user_type === 'artist';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-primary">
              {isArtist ? "Client Reviews" : "My Reviews"}
            </h1>
            <p className="text-muted-foreground">
              {isArtist 
                ? "See what clients are saying about your work"
                : "Rate your experiences and leave tips for artists"
              }
            </p>
          </div>
          
          {!isArtist && completedBookings.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Leave Review</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Leave a Review</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Booking to Review</Label>
                    <div className="space-y-2 mt-2">
                      {completedBookings.map((booking) => (
                        <Card
                          key={booking.id}
                          className={`p-3 cursor-pointer border-2 ${
                            selectedBooking?.id === booking.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <div className="text-sm">
                            <p className="font-medium">{booking.service.service_name}</p>
                            <p className="text-muted-foreground">
                              {booking.artist_profile.first_name} {booking.artist_profile.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(booking.booking_date), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {selectedBooking && (
                    <>
                      <div>
                        <Label>Rating</Label>
                        <div className="flex items-center gap-1 mt-2">
                          {renderStars(newRating, true)}
                        </div>
                      </div>

                      <div>
                        <Label>Comment (Optional)</Label>
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your experience..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Tip Amount (Optional)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">₦</span>
                          <Input
                            type="number"
                            value={tipAmount}
                            onChange={(e) => setTipAmount(e.target.value)}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>

                      <Button onClick={submitRating} className="w-full">
                        Submit Review
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Overview */}
        {isArtist && ratings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-6 h-6 fill-coral text-coral" />
                  <span className="text-3xl font-bold text-primary">{calculateAverageRating()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">{ratings.length}</div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-success mb-2">
                  ₦{ratings.reduce((sum, r) => sum + (r.tip_amount || 0), 0).toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Tips Received</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ratings List */}
        <div className="space-y-4">
          {ratings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">
                  {isArtist 
                    ? "Reviews from clients will appear here" 
                    : "Complete your first booking to leave a review"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            ratings.map((rating) => (
              <Card key={rating.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                        {isArtist ? (
                          rating.client_profile.profile_picture_url ? (
                            <img 
                              src={rating.client_profile.profile_picture_url} 
                              alt="Client"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {rating.client_profile.first_name[0]}
                            </span>
                          )
                        ) : (
                          rating.artist_profile.profile_picture_url ? (
                            <img 
                              src={rating.artist_profile.profile_picture_url} 
                              alt="Artist"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-semibold">
                              {rating.artist_profile.first_name[0]}
                            </span>
                          )
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {isArtist 
                              ? `${rating.client_profile.first_name} ${rating.client_profile.last_name}`
                              : `${rating.artist_profile.first_name} ${rating.artist_profile.last_name}`
                            }
                          </h4>
                          <div className="flex items-center">
                            {renderStars(rating.rating, false, "w-4 h-4")}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(rating.created_at), "MMM dd, yyyy")}
                          </div>
                          
                          <Badge variant="outline">
                            {rating.booking.service.service_name}
                          </Badge>
                        </div>
                        
                        {rating.comment && (
                          <div className="bg-accent/50 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                              <MessageCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <p className="text-sm">{rating.comment}</p>
                            </div>
                          </div>
                        )}
                        
                        {rating.tip_amount && rating.tip_amount > 0 && (
                          <div className="flex items-center gap-2 text-sm text-success">
                            <Gift className="w-4 h-4" />
                            <span>Tip: ₦{rating.tip_amount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Ratings;