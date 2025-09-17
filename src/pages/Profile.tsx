import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Star, MapPin, Phone, Instagram, Facebook, Award, Edit2, Save, X } from "lucide-react";

interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  location_city?: string;
  location_state?: string;
  instagram_handle?: string;
  facebook_page?: string;
  bio?: string;
  work_address?: string;
  profile_picture_url?: string;
  user_type?: string;
  is_verified?: boolean;
  subscription_active?: boolean;
}

interface ArtistStats {
  totalBookings: number;
  averageRating: number;
  totalEarnings: number;
  completionRate: number;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData>({});
  const [stats, setStats] = useState<ArtistStats>({
    totalBookings: 0,
    averageRating: 0,
    totalEarnings: 0,
    completionRate: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    // Get bookings count and earnings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('status, original_price, negotiated_price')
      .eq('artist_id', user.id);

    // Get ratings
    const { data: ratings } = await supabase
      .from('ratings')
      .select('rating')
      .eq('artist_id', user.id);

    if (bookings) {
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const totalEarnings = bookings.reduce((sum, booking) => 
        sum + Number(booking.negotiated_price || booking.original_price), 0);
      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      let averageRating = 0;
      if (ratings && ratings.length > 0) {
        averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      }

      setStats({
        totalBookings,
        averageRating,
        totalEarnings,
        completionRate
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/profile-picture.${fileExt}`;

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('makeupstudioappbucket')
        .upload(`profiles/${fileName}`, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('makeupstudioappbucket')
        .getPublicUrl(`profiles/${fileName}`);

      // Update profile with image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: data.publicUrl })
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, profile_picture_url: data.publicUrl }));
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    }
    
    setImageUploading(false);
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const isArtist = profile.user_type === 'artist';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-primary">My Profile</h1>
            <p className="text-muted-foreground">
              {isArtist ? "Showcase your makeup artistry" : "Manage your client profile"}
            </p>
          </div>
          
          <Button
            onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
            disabled={loading}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </>
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="text-center p-6">
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
                  {profile.profile_picture_url ? (
                    <img 
                      src={profile.profile_picture_url} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-white" />
                  )}
                </div>
                
                <label className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </label>
              </div>

              <h2 className="text-2xl font-playfair font-bold mb-2">
                {profile.first_name} {profile.last_name}
              </h2>
              
              <div className="flex justify-center items-center gap-2 mb-4">
                <Badge variant={profile.is_verified ? "default" : "secondary"}>
                  {profile.is_verified ? (
                    <>
                      <Award className="w-3 h-3 mr-1" />
                      Verified {isArtist ? "Artist" : "Client"}
                    </>
                  ) : (
                    `${isArtist ? "Artist" : "Client"}`
                  )}
                </Badge>
                
                {isArtist && profile.subscription_active && (
                  <Badge variant="outline" className="text-coral border-coral">
                    Premium
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                {profile.location_city && profile.location_state && (
                  <div className="flex items-center justify-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location_city}, {profile.location_state}
                  </div>
                )}
                
                {profile.phone_number && (
                  <div className="flex items-center justify-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile.phone_number}
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 mt-4">
                {profile.instagram_handle && (
                  <a
                    href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                
                {profile.facebook_page && (
                  <a
                    href={profile.facebook_page}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Details & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Artist Stats */}
            {isArtist && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.totalBookings}</div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                        {stats.averageRating.toFixed(1)}
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">₦{stats.totalEarnings.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-coral">{stats.completionRate.toFixed(0)}%</div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={profile.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={profile.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phone Number</Label>
                        <Input
                          value={profile.phone_number || ''}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={profile.location_city || ''}
                          onChange={(e) => handleInputChange('location_city', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={profile.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder={isArtist ? "Tell clients about your expertise..." : "Tell artists about yourself..."}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Instagram</Label>
                        <Input
                          value={profile.instagram_handle || ''}
                          onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <Label>Facebook</Label>
                        <Input
                          value={profile.facebook_page || ''}
                          onChange={(e) => handleInputChange('facebook_page', e.target.value)}
                          placeholder="facebook.com/page"
                        />
                      </div>
                    </div>

                    {isArtist && (
                      <div>
                        <Label>Work Address</Label>
                        <Textarea
                          value={profile.work_address || ''}
                          onChange={(e) => handleInputChange('work_address', e.target.value)}
                          placeholder="Your studio or preferred work location"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={handleProfileUpdate} disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">About</h4>
                      <p className="text-muted-foreground">
                        {profile.bio || "No bio added yet."}
                      </p>
                    </div>

                    {isArtist && profile.work_address && (
                      <div>
                        <h4 className="font-medium mb-2">Work Location</h4>
                        <p className="text-muted-foreground">{profile.work_address}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Email: {user?.email}</p>
                        {profile.phone_number && <p>Phone: {profile.phone_number}</p>}
                        {profile.location_city && (
                          <p>Location: {profile.location_city}, {profile.location_state}</p>
                        )}
                      </div>
                    </div>

                    {(profile.instagram_handle || profile.facebook_page) && (
                      <div>
                        <h4 className="font-medium mb-2">Social Media</h4>
                        <div className="space-y-1 text-sm">
                          {profile.instagram_handle && (
                            <a
                              href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:text-primary/80"
                            >
                              <Instagram className="w-4 h-4" />
                              {profile.instagram_handle}
                            </a>
                          )}
                          {profile.facebook_page && (
                            <a
                              href={profile.facebook_page}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:text-primary/80"
                            >
                              <Facebook className="w-4 h-4" />
                              Facebook Page
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;