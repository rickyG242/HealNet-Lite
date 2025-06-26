
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Package, MapPin, User, Phone, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Donation } from '../pages/Index';

interface DonationFormProps {
  onSubmit: (donation: Omit<Donation, 'id' | 'timestamp'>) => void;
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

export const DonationForm: React.FC<DonationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    item: '',
    category: '',
    quantity: 1,
    location: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.donorName || !formData.donorEmail || !formData.item || !formData.category || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSubmit(formData);

    toast({
      title: "Donation Submitted Successfully!",
      description: "We're now searching for the best matches for your generous donation.",
    });

    // Reset form
    setFormData({
      donorName: '',
      donorEmail: '',
      donorPhone: '',
      item: '',
      category: '',
      quantity: 1,
      location: '',
      description: '',
    });

    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b">
        <CardTitle className="flex items-center space-x-2 text-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-2 rounded-full">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <span>Donation Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donor Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donorName">Full Name *</Label>
                <Input
                  id="donorName"
                  value={formData.donorName}
                  onChange={(e) => handleInputChange('donorName', e.target.value)}
                  placeholder="Enter your full name"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="donorPhone">Phone Number</Label>
                <Input
                  id="donorPhone"
                  type="tel"
                  value={formData.donorPhone}
                  onChange={(e) => handleInputChange('donorPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="donorEmail">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="donorEmail"
                  type="email"
                  value={formData.donorEmail}
                  onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                  placeholder="your.email@example.com"
                  className="pl-10 border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Donation Information Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Donation Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item">Item Name *</Label>
                <Input
                  id="item"
                  value={formData.item}
                  onChange={(e) => handleInputChange('item', e.target.value)}
                  placeholder="e.g., Medical masks, Baby formula"
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-blue-500">
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
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Your Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => handleInputChange('location', value)}
                  >
                    <SelectTrigger className="pl-10 border-gray-300 focus:border-blue-500">
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
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
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
