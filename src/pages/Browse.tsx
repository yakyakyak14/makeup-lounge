import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Star, Calendar, DollarSign } from "lucide-react";

interface Artist {
  user_id: string;
  first_name: string;
  last_name: string;
  location_city?: string;
  location_state?: string;
  bio?: string;
  profile_picture_url?: string;
  is_verified: boolean;
  services: any[];
  average_rating: number;
  total_bookings: number;
}

const Browse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState("");
  const [travelAddress, setTravelAddress] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        user_id, first_name, last_name, location_city, location_state, 
        bio, profile_picture_url, is_verified,
        services(*)
      `)
      .eq('user_type', 'artist');

    if (profilesError) {
      console.error(profilesError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      setArtists([]);
      return;
    }

    const artistIds = profiles.map(p => p.user_id);

    // Fetch rating stats from materialized view if available, else fallback to normal view
    let ratingStats: any[] = [];
    let statsError: any = null;
    const rs = await supabase
      .from('artist_rating_stats_mat')
      .select('*')
      .in('artist_id', artistIds);

    if (rs.error) {
      const rs2 = await supabase
        .from('artist_rating_stats')
        .select('*')
        .in('artist_id', artistIds);
      statsError = rs2.error;
      ratingStats = rs2.data || [];
    } else {
      ratingStats = rs.data || [];
    }

    if (statsError) {
      console.error(statsError);
    }

    const statsMap = new Map<string, { average_rating: number; ratings_count: number; last_rating_at: string | null }>();
    ratingStats.forEach((row: any) => {
      statsMap.set(row.artist_id, {
        average_rating: Number(row.average_rating) || 0,
        ratings_count: Number(row.ratings_count) || 0,
        last_rating_at: row.last_rating_at || null,
      });
    });

    // Fetch all bookings for these artists and aggregate counts client-side
    const { data: bookingsAll, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, artist_id')
      .in('artist_id', artistIds)
      .eq('status', 'completed');

    if (bookingsError) {
      console.error(bookingsError);
    }

    const bookingCountMap = new Map<string, number>();
    (bookingsAll || []).forEach((b: any) => {
      bookingCountMap.set(b.artist_id, (bookingCountMap.get(b.artist_id) || 0) + 1);
    });

    const merged = profiles.map((profile) => {
      const s = statsMap.get(profile.user_id);
      return {
        ...profile,
        average_rating: s?.average_rating || 0,
        total_bookings: bookingCountMap.get(profile.user_id) || 0,
      };
    });

    setArtists(merged);
  };

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = 
      `${artist.first_name} ${artist.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      artist.location_city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      artist.location_state?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesLocation;
  });

  const openBooking = (artist: Artist) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to create a booking.",
      });
      navigate('/auth');
      return;
    }
    setSelectedArtist(artist);
    const firstService = artist.services?.[0];
    setSelectedServiceId(firstService?.id || "");
    setBookingDate("");
    setTravelAddress("");
    setClientNotes("");
    setBookingOpen(true);
  };

  const createBooking = async () => {
    if (!user || !selectedArtist || !selectedServiceId || !bookingDate) {
      toast({ title: "Missing details", description: "Please select service and date/time." , variant: "destructive"});
      return;
    }

    const chosenService = selectedArtist.services.find((s: any) => s.id === selectedServiceId);
    if (!chosenService) {
      toast({ title: "Invalid service", description: "Please select a valid service.", variant: "destructive" });
      return;
    }

    setBookingLoading(true);
    try {
      const { error } = await supabase.from('bookings').insert({
        artist_id: selectedArtist.user_id,
        client_id: user.id,
        service_id: selectedServiceId,
        booking_date: new Date(bookingDate).toISOString(),
        original_price: Number(chosenService.base_price || 0),
        status: 'pending',
        travel_address: travelAddress || null,
        client_notes: clientNotes || null,
      });

      if (error) throw error;

      toast({ title: "Booking request sent", description: "The artist will review and respond soon." });
      setBookingOpen(false);
      navigate('/bookings');
    } catch (e) {
      console.error(e);
      toast({ title: "Booking failed", description: "Could not create booking. Try again.", variant: "destructive" });
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-primary">Browse Artists</h1>
          <p className="text-muted-foreground">Discover talented makeup artists for your special occasion</p>
        </div>

        {/* Search Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artists by name or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => (
            <Card key={artist.user_id} className="hover-lift">
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden mb-4">
                  {artist.profile_picture_url ? (
                    <img src={artist.profile_picture_url} alt="Artist" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-lg">{artist.first_name[0]}</span>
                  )}
                </div>
                <CardTitle className="text-xl">{artist.first_name} {artist.last_name}</CardTitle>
                <div className="flex justify-center gap-2">
                  {artist.is_verified && <Badge>Verified</Badge>}
                  {artist.average_rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-coral text-coral" />
                      <span className="text-sm">{artist.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {artist.location_city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {artist.location_city}, {artist.location_state}
                  </div>
                )}
                
                <p className="text-sm line-clamp-3">{artist.bio || "No bio available"}</p>
                
                <div className="text-xs text-muted-foreground">
                  {artist.services?.length || 0} services • {artist.total_bookings} bookings
                </div>
                
                <Button className="w-full" onClick={() => openBooking(artist)}>View Profile & Book</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    {/* Booking Dialog */}
    <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Booking</DialogTitle>
        </DialogHeader>
        {selectedArtist && (
          <div className="space-y-4">
            <div>
              <Label>Service</Label>
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {selectedArtist.services?.map((svc: any) => (
                    <SelectItem key={svc.id} value={svc.id}>
                      {svc.service_name} • ₦{Number(svc.base_price).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
            </div>
            <div>
              <Label>Travel Address (optional)</Label>
              <Input value={travelAddress} onChange={(e) => setTravelAddress(e.target.value)} placeholder="Client location if travel is required" />
            </div>
            <div>
              <Label>Notes to Artist (optional)</Label>
              <Textarea value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} placeholder="Share any preferences or details" />
            </div>
            <Button onClick={createBooking} disabled={bookingLoading} className="w-full">
              {bookingLoading ? 'Sending...' : 'Send Booking Request'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </DashboardLayout>
  );
};

export default Browse;