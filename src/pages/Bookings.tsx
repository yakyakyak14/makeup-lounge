import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, DollarSign, Clock, MessageCircle, CheckCircle, XCircle, Eye, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  booking_date: string;
  status: string;
  original_price: number;
  negotiated_price?: number;
  platform_fee?: number;
  travel_address?: string;
  client_notes?: string;
  artist_notes?: string;
  service: {
    service_name: string;
    service_type: string;
  };
  client_profile: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
  artist_profile: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
}

interface Profile {
  user_type: string;
}

const Bookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [negotiationPrice, setNegotiationPrice] = useState("");
  const [responseNotes, setResponseNotes] = useState("");
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      fetchBookings();
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

  const fetchBookings = async () => {
    if (!user || !profile) return;
    
    const isArtist = profile.user_type === 'artist';
    const userField = isArtist ? 'artist_id' : 'client_id';
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(service_name, service_type),
        client_profile:profiles!bookings_client_id_fkey(first_name, last_name, phone_number),
        artist_profile:profiles!bookings_artist_id_fkey(first_name, last_name, phone_number)
      `)
      .eq(userField, user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBookings(data);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string, negotiatedPrice?: number) => {
    setStatusUpdatingId(bookingId);
    const updates: any = { status };
    if (typeof negotiatedPrice === 'number' && !Number.isNaN(negotiatedPrice)) {
      updates.negotiated_price = negotiatedPrice;
    }
    if (responseNotes) {
      updates.artist_notes = responseNotes;
    }

    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId);

    setStatusUpdatingId(null);

    if (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
      return false;
    } else {
      toast({
        title: "Success",
        description: `Booking ${status} successfully`,
      });
      fetchBookings();
      setSelectedBooking(null);
      setNegotiationPrice("");
      setResponseNotes("");
      return true;
    }
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

  const calculateTotal = (booking: Booking) => {
    const price = booking.negotiated_price || booking.original_price;
    const platformFee = booking.platform_fee || (price * 0.05); // 5% platform fee
    return price + platformFee;
  };

  const isArtist = profile?.user_type === 'artist';

  const handlePayment = (booking: Booking) => {
    setSelectedBooking(booking);
    setPaymentDialog(true);
  };

  const processPayment = async () => {
    if (!selectedBooking) return;
    
    // Here you would integrate with actual payment processor
    // For now, we'll simulate payment success
    toast({
      title: "Payment Processed",
      description: "Payment has been processed successfully!",
    });
    
    // Update booking status to confirmed after payment
    updateBookingStatus(selectedBooking.id, 'confirmed');
    setPaymentDialog(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-primary">My Bookings</h1>
          <p className="text-muted-foreground">
            {isArtist ? "Manage your client bookings" : "Track your beauty appointments"}
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground">
                {isArtist 
                  ? "Bookings from clients will appear here" 
                  : "Start by browsing artists and making your first booking"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover-lift">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{booking.service.service_name}</CardTitle>
                      <p className="text-muted-foreground capitalize">{booking.service.service_type}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {format(new Date(booking.booking_date), "MMM dd, yyyy 'at' HH:mm")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        ₦{(booking.negotiated_price || booking.original_price).toLocaleString()}
                        {booking.negotiated_price && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (was ₦{booking.original_price.toLocaleString()})
                          </span>
                        )}
                      </span>
                    </div>

                    {booking.travel_address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate">{booking.travel_address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {isArtist 
                          ? `${booking.client_profile.first_name} ${booking.client_profile.last_name}`
                          : `${booking.artist_profile.first_name} ${booking.artist_profile.last_name}`
                        }
                      </span>
                    </div>
                  </div>

                  {(booking.client_notes || booking.artist_notes) && (
                    <div className="space-y-2">
                      {booking.client_notes && (
                        <div className="bg-accent/50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Client Notes:</p>
                          <p className="text-sm">{booking.client_notes}</p>
                        </div>
                      )}
                      {booking.artist_notes && (
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Artist Notes:</p>
                          <p className="text-sm">{booking.artist_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {isArtist && booking.status === 'pending' && (
                      <>
                        <Dialog
                          open={selectedBooking?.id === booking.id && acceptDialogOpen}
                          onOpenChange={(open) => {
                            if (!open) {
                              setAcceptDialogOpen(false);
                              setSelectedBooking(null);
                              setNegotiationPrice("");
                              setResponseNotes("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setAcceptDialogOpen(true);
                              }}
                              disabled={statusUpdatingId === booking.id}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Accept Booking</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="negotiated_price">Negotiated Price (optional)</Label>
                                <Input
                                  id="negotiated_price"
                                  type="number"
                                  value={negotiationPrice}
                                  onChange={(e) => setNegotiationPrice(e.target.value)}
                                  placeholder={booking.original_price.toString()}
                                />
                                <p className="text-sm text-muted-foreground">
                                  Original price: ₦{booking.original_price.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <Label htmlFor="artist_notes">Notes to Client</Label>
                                <Textarea
                                  id="artist_notes"
                                  value={responseNotes}
                                  onChange={(e) => setResponseNotes(e.target.value)}
                                  placeholder="Any additional information for the client..."
                                />
                              </div>
                              <Button
                                onClick={async () => {
                                  const ok = await updateBookingStatus(
                                    booking.id,
                                    'confirmed',
                                    negotiationPrice !== '' ? Number(negotiationPrice) : undefined
                                  );
                                  if (ok) setAcceptDialogOpen(false);
                                }}
                                className="w-full"
                                disabled={statusUpdatingId === booking.id}
                              >
                                Confirm Booking
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => { await updateBookingStatus(booking.id, 'cancelled'); }}
                          disabled={statusUpdatingId === booking.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Decline
                        </Button>
                      </>
                    )}

                    {!isArtist && booking.status === 'confirmed' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handlePayment(booking)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </Button>
                    )}

                    {booking.status === 'confirmed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateBookingStatus(booking.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Payment Dialog */}
        <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="bg-accent/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">{selectedBooking.service.service_name}</h4>
                  <div className="text-sm space-y-1">
                    <p>Service Price: ₦{(selectedBooking.negotiated_price || selectedBooking.original_price).toLocaleString()}</p>
                    <p>Platform Fee: ₦{(selectedBooking.platform_fee || ((selectedBooking.negotiated_price || selectedBooking.original_price) * 0.05)).toLocaleString()}</p>
                    <hr className="my-2" />
                    <p className="font-semibold">Total: ₦{calculateTotal(selectedBooking).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Card Payment
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Bank Transfer
                    </Button>
                  </div>
                </div>

                <Button onClick={processPayment} className="w-full">
                  Process Payment
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Bookings;