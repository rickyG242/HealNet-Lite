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
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' };
    if (score >= 40) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' };
    return { label: 'Partial', color: 'bg-muted text-muted-foreground border-border' };
  };

  const handleContactOrganization = (match: Match) => {
    const orgName = match.need.organization?.organization_name || 'Organization';
    toast({
      title: "Contact Information Ready!",
      description: `${orgName} contact details are available below.`,
    });
    
    console.log('Contacting organization:', match.need);
  };

  const handleConfirmDonation = (match: Match) => {
    const orgName = match.need.organization?.organization_name || 'Organization';
    toast({
      title: "Donation Confirmed!",
      description: `Thank you! We've notified ${orgName} about your donation.`,
    });
    
    console.log('Donation confirmed:', match);
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No matches yet</h3>
        <p className="text-muted-foreground">Submit a donation to see potential matches with organization needs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {matches.map((match, index) => {
        const matchQuality = getMatchQuality(match.matchScore);
        
        return (
          <Card key={`${match.donation.id}-${match.need.id}`} className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span>Match Found #{index + 1}</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={`${matchQuality.color} flex items-center space-x-1`}>
                    <Star className="h-3 w-3" />
                    <span>{matchQuality.label} Match</span>
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    Score: {match.matchScore}%
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your Donation */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center space-x-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span>Your Donation</span>
                  </h3>
                  
                  <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-primary">{match.donation.item}</p>
                    <p className="text-sm text-muted-foreground">Category: {match.donation.category}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {match.donation.quantity}</p>
                    <p className="text-sm text-muted-foreground">Location: {match.donation.location}</p>
                    {match.donation.description && (
                      <p className="text-sm text-muted-foreground">Notes: {match.donation.description}</p>
                    )}
                  </div>
                </div>

                {/* Organization Need */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-accent" />
                    <span>Organization Need</span>
                  </h3>
                  
                  <div className="bg-accent/5 p-4 rounded-lg space-y-2">
                    <p className="font-medium text-accent-foreground">
                      {match.need.organization?.organization_name || 'Organization'}
                    </p>
                    <p className="text-sm text-muted-foreground">Needs: {match.need.item}</p>
                    <p className="text-sm text-muted-foreground">Category: {match.need.category}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {match.need.quantity}</p>
                    <p className="text-sm text-muted-foreground">Urgency: {match.need.urgency}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-foreground">
                      Contact: {match.need.organization?.contact_person || 'Contact Person'}
                    </p>
                    <div className="flex items-center space-x-2 text-primary">
                      <Mail className="h-3 w-3" />
                      <a 
                        href={`mailto:${match.need.organization?.email}`} 
                        className="hover:underline"
                      >
                        {match.need.organization?.email}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-primary">
                      <Phone className="h-3 w-3" />
                      <a 
                        href={`tel:${match.need.organization?.phone}`} 
                        className="hover:underline"
                      >
                        {match.need.organization?.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{match.need.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropoff Instructions */}
              {match.need.dropoff_instructions && (
                <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <h4 className="font-medium text-accent-foreground mb-2 flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Dropoff Instructions</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">{match.need.dropoff_instructions}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleContactOrganization(match)}
                  variant="outline"
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Organization
                </Button>
                
                <Button
                  onClick={() => handleConfirmDonation(match)}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
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