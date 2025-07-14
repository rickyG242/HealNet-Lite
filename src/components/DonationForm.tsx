import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Package, MapPin, User, LogIn } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface DonationFormProps {
  onSubmit: (donation: {
    item: string;
    category: string;
    quantity: number;
    location: string;
    description?: string;
  }) => void;
  loading?: boolean;
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

export const DonationForm: React.FC<DonationFormProps> = ({ onSubmit, loading = false }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    item: '',
    category: '',
    quantity: 1,
    location: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a donation.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.item || !formData.category || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(formData);

    // Reset form
    setFormData({
      item: '',
      category: '',
      quantity: 1,
      location: '',
      description: '',
    });
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
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-3 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Finding Matches...</span>
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