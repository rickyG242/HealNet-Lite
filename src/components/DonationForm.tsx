import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Package, MapPin, User, LogIn, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { geocodingService } from '@/services/geocodingService';

interface DonationFormProps {
  onSuccess?: (donationId: string) => void;
  redirectOnSuccess?: boolean;
}

const categories = [
  'Medical Supplies',
  'Food & Nutrition',
  'Clothing & Textiles',
  'Comfort Items',
  'Technology',
  'Hygiene Products',
  'Educational Materials',
  'Other',
];

const locations = [
  'Downtown District',
  'Westside',
  'North District',
  'South District',
  'East District',
  'Suburban Area',
  'Other',
];

export const DonationForm: React.FC<DonationFormProps> = ({ onSuccess, redirectOnSuccess = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item: '',
    category: '',
    quantity: 1,
    location: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.item || !formData.category || !formData.location) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit a donation.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Geocode the location
      const geocodeResult = await geocodingService.geocode(formData.location);
      
      if (geocodeResult.quality === 'failed') {
        throw new Error('Could not determine the location. Please try a more specific address.');
      }
      
      // Create Supabase client
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      // Insert donation into database
      const { data: donation, error } = await supabase
        .from('donations')
        .insert({
          donor_id: user.id,
          item: formData.item,
          category: formData.category,
          quantity: formData.quantity,
          location: formData.location,
          description: formData.description,
          lat: geocodeResult.lat,
          lng: geocodeResult.lng,
          formatted_address: geocodeResult.formattedAddress,
          geocode_quality: geocodeResult.quality,
          status: 'pending',
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(donation.id);
      }
      
      // Redirect to matches page if enabled
      if (redirectOnSuccess) {
        navigate(`/donations/${donation.id}/matches`);
      }
      
      // Show success message
      toast({
        title: 'Donation submitted!',
        description: 'Finding the best matches for your donation...',
      });
      
    } catch (error) {
      console.error('Error submitting donation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit donation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <Card className="w-full shadow-lg border-0 bg-card">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-full">
              <LogIn className="h-5 w-5 text-white" />
            </div>
            <span>Authentication Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-6">
            Please sign in to submit a donation and help connect with organizations in need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
          </div>
          {!user && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-card">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <CardTitle className="flex items-center space-x-2 text-2xl">
          <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-full">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span>Donation Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donation Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Donation Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item">Item Name *</Label>
                <Input
                  id="item"
                  value={formData.item}
                  onChange={(e) => handleInputChange('item', e.target.value)}
                  placeholder="e.g., Medical masks, Baby formula"
                  className="border-input focus:border-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="border-input focus:border-ring">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  className="border-input focus:border-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Your Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => handleInputChange('location', value)}
                  >
                    <SelectTrigger className="pl-10 border-input focus:border-ring">
                      <SelectValue placeholder="Select your area" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Any additional information about your donation (condition, expiry dates, special handling, etc.)"
                rows={3}
                className="border-input focus:border-ring"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-3 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Submit Donation</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};