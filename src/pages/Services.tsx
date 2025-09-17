import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Minus, Edit2, Trash2, DollarSign, Users, MapPin, Calendar, Star } from "lucide-react";

interface Service {
  id: string;
  service_name: string;
  service_type: string;
  description?: string;
  base_price: number;
  max_people: number;
  travel_required: boolean;
  includes_bridal_shower: boolean;
  created_at: string;
}

const Services = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    service_name: "",
    service_type: "",
    description: "",
    base_price: "",
    max_people: "1",
    travel_required: false,
    includes_bridal_shower: false
  });

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('artist_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setServices(data);
    }
  };

  const serviceTypes = [
    'Bridal Makeup',
    'Event Makeup',
    'Photoshoot Makeup',
    'Party Makeup',
    'Casual Makeup',
    'Special Effects',
    'Traditional Makeup',
    'Corporate Makeup'
  ];

  const resetForm = () => {
    setFormData({
      service_name: "",
      service_type: "",
      description: "",
      base_price: "",
      max_people: "1",
      travel_required: false,
      includes_bridal_shower: false
    });
    setEditingService(null);
  };

  // Helpers for currency formatting (₦) and parsing
  const parseNaira = (val: string) => {
    const numeric = val.replace(/[^0-9]/g, "");
    return Number(numeric || 0);
  };

  const formatWithCommas = (num: number) => {
    return num.toLocaleString("en-NG");
  };

  const handleBasePriceChange = (value: string) => {
    const parsed = parseNaira(value);
    setFormData(prev => ({ ...prev, base_price: parsed === 0 ? "" : formatWithCommas(parsed) }));
  };

  const adjustBasePrice = (delta: number) => {
    const current = parseNaira(formData.base_price);
    const next = Math.max(0, current + delta);
    setFormData(prev => ({ ...prev, base_price: next === 0 ? "" : formatWithCommas(next) }));
  };

  const handleSubmit = async () => {
    if (!formData.service_name || !formData.service_type || !formData.base_price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const serviceData = {
      ...formData,
      base_price: parseNaira(formData.base_price),
      max_people: Number(formData.max_people),
      artist_id: user?.id
    };

    let error;
    
    if (editingService) {
      const { error: updateError } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', editingService.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('services')
        .insert(serviceData);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingService ? 'update' : 'create'} service. ${error.message || 'Please try again.'}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Service ${editingService ? 'updated' : 'created'} successfully!`,
      });
      
      resetForm();
      setIsDialogOpen(false);
      fetchServices();
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      service_name: service.service_name,
      service_type: service.service_type,
      description: service.description || "",
      base_price: formatWithCommas(service.base_price),
      max_people: service.max_people.toString(),
      travel_required: service.travel_required,
      includes_bridal_shower: service.includes_bridal_shower
    });
    setEditingService(service);
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Service deleted successfully!",
      });
      fetchServices();
    }
  };

  const getServiceIcon = (serviceType: string) => {
    if (serviceType.toLowerCase().includes('bridal')) return '💐';
    if (serviceType.toLowerCase().includes('event')) return '🎉';
    if (serviceType.toLowerCase().includes('photo')) return '📸';
    if (serviceType.toLowerCase().includes('party')) return '🎊';
    if (serviceType.toLowerCase().includes('special')) return '🎭';
    if (serviceType.toLowerCase().includes('traditional')) return '👑';
    if (serviceType.toLowerCase().includes('corporate')) return '💼';
    return '💄';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-primary">My Services</h1>
            <p className="text-muted-foreground">Manage your makeup services and pricing</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Edit Service' : 'Create New Service'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_name">Service Name *</Label>
                    <Input
                      id="service_name"
                      value={formData.service_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, service_name: e.target.value }))}
                      placeholder="e.g., Bridal Glam Package"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="service_type">Service Type *</Label>
                    <Select value={formData.service_type} onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what's included in this service..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="base_price">Base Price (₦) *</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adjustBasePrice(-500)}
                        aria-label="Decrease by ₦500"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="base_price"
                        type="text"
                        inputMode="numeric"
                        value={formData.base_price}
                        onChange={(e) => handleBasePriceChange(e.target.value)}
                        onWheel={(e) => {
                          e.preventDefault();
                          const delta = (e as any).deltaY < 0 ? 500 : -500;
                          adjustBasePrice(delta);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp') { e.preventDefault(); adjustBasePrice(500); }
                          if (e.key === 'ArrowDown') { e.preventDefault(); adjustBasePrice(-500); }
                        }}
                        placeholder="15,000"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => adjustBasePrice(500)}
                        aria-label="Increase by ₦500"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Use arrows, scroll, or +/- to adjust in ₦500 steps.</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="max_people">Max People</Label>
                    <Input
                      id="max_people"
                      type="number"
                      value={formData.max_people}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_people: e.target.value }))}
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="travel_required">Travel Service</Label>
                      <p className="text-sm text-muted-foreground">
                        There is a 30% extra charge for services requiring the artist to travel within Nigeria,
                        50% for travel outside Nigeria but within Africa, and 75% for services outside Africa.
                        All travel expenses, accommodation, and feeding are handled by the client.
                      </p>
                    </div>
                    <Switch
                      id="travel_required"
                      checked={formData.travel_required}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, travel_required: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="includes_bridal_shower">Includes Bridal Shower</Label>
                      <p className="text-sm text-muted-foreground">Service includes bridal shower makeup</p>
                    </div>
                    <Switch
                      id="includes_bridal_shower"
                      checked={formData.includes_bridal_shower}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includes_bridal_shower: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingService ? 'Update Service' : 'Create Service'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Services Grid */}
        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Star className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first makeup service to attract clients
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="hover-lift">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getServiceIcon(service.service_type)}</span>
                      <div>
                        <CardTitle className="text-lg">{service.service_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{service.service_type}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm">Base Price</span>
                      </div>
                      <span className="font-semibold text-primary">₦{service.base_price.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">Max People</span>
                      </div>
                      <span className="text-sm">{service.max_people}</span>
                    </div>
                    
                    {service.travel_required && (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <MapPin className="h-4 w-4" />
                        <span>Travel service available</span>
                      </div>
                    )}
                    
                    {service.includes_bridal_shower && (
                      <div className="flex items-center gap-2 text-sm text-coral">
                        <Calendar className="h-4 w-4" />
                        <span>Includes bridal shower</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/bookings')}
                    >
                      View Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Services;