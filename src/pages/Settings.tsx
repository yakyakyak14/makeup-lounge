import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Monitor, Save, User, Bell, Shield, CreditCard } from "lucide-react";

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
  account_number?: string;
  bank_name?: string;
  account_name?: string;
  user_type?: string;
}

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData>({});
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email_bookings: true,
    email_reviews: true,
    email_promotions: false,
    sms_reminders: true
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
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
    }
    setLoading(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
    'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
    'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
    'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const isArtist = profile.user_type === 'artist';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-primary">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and profile information</p>
        </div>

        <div className="grid gap-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme Preference</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {themeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "default" : "outline"}
                      onClick={() => setTheme(option.value)}
                      className="justify-start"
                    >
                      <option.icon className="mr-2 h-4 w-4" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={profile.location_state || ''} onValueChange={(value) => handleInputChange('location_state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.location_city || ''}
                  onChange={(e) => handleInputChange('location_city', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={isArtist ? "Tell clients about your expertise and style..." : "Tell artists about your preferences..."}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    value={profile.instagram_handle || ''}
                    onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
                    placeholder="@username"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook Page</Label>
                  <Input
                    id="facebook"
                    value={profile.facebook_page || ''}
                    onChange={(e) => handleInputChange('facebook_page', e.target.value)}
                    placeholder="facebook.com/page"
                  />
                </div>
              </div>

              {isArtist && (
                <div>
                  <Label htmlFor="work_address">Work Address</Label>
                  <Textarea
                    id="work_address"
                    value={profile.work_address || ''}
                    onChange={(e) => handleInputChange('work_address', e.target.value)}
                    placeholder="Your studio or preferred work location"
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information (Artists only) */}
          {isArtist && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    value={profile.bank_name || ''}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="account_name">Account Name</Label>
                  <Input
                    id="account_name"
                    value={profile.account_name || ''}
                    onChange={(e) => handleInputChange('account_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    value={profile.account_number || ''}
                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Booking Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for new bookings</p>
                </div>
                <Switch
                  checked={notifications.email_bookings}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_bookings: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Review Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you receive new reviews</p>
                </div>
                <Switch
                  checked={notifications.email_reviews}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_reviews: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive SMS reminders for upcoming appointments</p>
                </div>
                <Switch
                  checked={notifications.sms_reminders}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms_reminders: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Promotional Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about new features and promotions</p>
                </div>
                <Switch
                  checked={notifications.email_promotions}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email_promotions: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input value={user?.email || ''} disabled />
                <p className="text-sm text-muted-foreground mt-1">Contact support to change your email</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>

          {/* Save Changes */}
          <div className="flex justify-end">
            <Button onClick={handleProfileUpdate} disabled={loading} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;