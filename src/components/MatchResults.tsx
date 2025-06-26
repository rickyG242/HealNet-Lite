
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Phone, Mail, MapPin, Package, Building2, Star, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Match } from '../pages/Index';

interface MatchResultsProps {
  matches: Match[];
}

export const MatchResults: React.FC<MatchResultsProps> = ({ matches }) => {
  const getMatchQuality = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 40) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Partial', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const handleContactHospital = (match: Match) => {
    toast({
      title: "Contact Information Copied!",
      description: `${match.need.hospitalName} contact details are ready for you.`,
    });
    
    // In a real app, this would open email client or copy contact info
    console.log('Contacting hospital:', match.need);
  };

  const handleConfirmDonation = (match: Match) => {
    toast({
      title: "Donation Confirmed!",
      description: `Thank you! We've notified ${match.need.hospitalName} about your donation.`,
    });
    
    // In a real app, this would send notifications and update the database
    console.log('Donation confirmed:', match);
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No matches yet</h3>
        <p className="text-gray-500">Submit a donation to see potential matches with hospital needs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {matches.map((match, index) => {
        const matchQuality = getMatchQuality(match.matchScore);
        
        return (
          <Card key={`${match.donation.id}-${match.need.id}`} className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span>Match Found #{index + 1}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={`${matchQuality.color} flex items-center space-x-1`}>
                    <Star className="h-3 w-3" />
                    <span>{matchQuality.label} Match</span>
                  </Badge>
                  <Badge variant="outline" className="text-gray-600">
                    Score: {match.matchScore}%
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your Donation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Package className="h-4 w-4 text-green-600" />
                    <span>Your Donation</span>
                  </h3>
                  
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-green-900">{match.donation.item}</p>
                    <p className="text-sm text-green-700">Category: {match.donation.category}</p>
                    <p className="text-sm text-green-700">Quantity: {match.donation.quantity}</p>
                    <p className="text-sm text-green-700">Location: {match.donation.location}</p>
                    {match.donation.description && (
                      <p className="text-sm text-green-700">Notes: {match.donation.description}</p>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <p><strong>Donor:</strong> {match.donation.donorName}</p>
                    <p><strong>Email:</strong> {match.donation.donorEmail}</p>
                    {match.donation.donorPhone && (
                      <p><strong>Phone:</strong> {match.donation.donorPhone}</p>
                    )}
                  </div>
                </div>

                {/* Hospital Need */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span>Hospital Need</span>
                  </h3>
                  
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-blue-900">{match.need.hospitalName}</p>
                    <p className="text-sm text-blue-700">Needs: {match.need.item}</p>
                    <p className="text-sm text-blue-700">Category: {match.need.category}</p>
                    <p className="text-sm text-blue-700">Quantity: {match.need.quantity}</p>
                    <p className="text-sm text-blue-700">Urgency: {match.need.urgency}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-900">Contact: {match.need.contactPerson}</p>
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${match.need.contactEmail}`} className="hover:underline">
                        {match.need.contactEmail}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${match.need.contactPhone}`} className="hover:underline">
                        {match.need.contactPhone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{match.need.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropoff Instructions */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-900 mb-2 flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Dropoff Instructions</span>
                </h4>
                <p className="text-sm text-orange-800">{match.need.dropoffInstructions}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleContactHospital(match)}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Hospital
                </Button>
                
                <Button
                  onClick={() => handleConfirmDonation(match)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Donation
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
