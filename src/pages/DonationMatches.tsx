import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { matchingService } from '../services/matchingService';
import MatchResultsList from '../components/MatchResultsList';
import { Button } from '../components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Donation {
  id: string;
  item: string;
  category: string;
  quantity: number;
  location: string;
  lat?: number;
  lng?: number;
  status: string;
  created_at: string;
  donor_id: string;
}

const DonationMatches: React.FC = () => {
  const { donationId } = useParams<{ donationId: string }>();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const fetchDonationAndMatches = async () => {
      if (!donationId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch donation details
        const { data: donationData, error: donationError } = await supabase
          .from('donations')
          .select('*')
          .eq('id', donationId)
          .single();
          
        if (donationError) throw donationError;
        
        setDonation(donationData);
        
        // Find matches for this donation
        const matches = await matchingService.findBestMatches(donationData);
        setMatches(matches);
        
        // Select the first match by default if available
        if (matches.length > 0) {
          setSelectedMatch(matches[0]);
        }
        
      } catch (error) {
        console.error('Error fetching donation or matches:', error);
        toast({
          title: 'Error',
          description: 'Failed to load donation details or matches.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDonationAndMatches();
  }, [donationId, toast]);

  const handleSelectMatch = (match: any) => {
    setSelectedMatch(match);
  };

  const handleContactOrganization = async () => {
    if (!selectedMatch) return;
    
    try {
      // Here you would typically send a notification to the organization
      // For now, we'll just show a success message
      toast({
        title: 'Contact Initiated',
        description: `You've initiated contact with ${selectedMatch.need.organization.name} about your donation.`,
      });
      
      // Update donation status to 'matched' or similar
      const { error } = await supabase
        .from('donations')
        .update({ status: 'matched', matched_need_id: selectedMatch.need.id })
        .eq('id', donationId);
        
      if (error) throw error;
      
      // Redirect to donations list or dashboard
      navigate('/donations');
      
    } catch (error) {
      console.error('Error contacting organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate contact with the organization.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && !donation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Finding matches...</span>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Donation Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The donation you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Donation Matches</h1>
        <p className="text-muted-foreground">
          We've found {matches.length} potential matches for your donation of {donation.quantity} {donation.item}(s).
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matches List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Matches</h2>
          <MatchResultsList 
            matches={matches}
            onSelectMatch={handleSelectMatch}
            selectedMatchId={selectedMatch?.need?.id}
            isLoading={isLoading}
          />
        </div>
        
        {/* Match Details */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Match Details</h2>
            
            {selectedMatch ? (
              <div className="bg-card rounded-lg border p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Organization</h3>
                    <p className="text-muted-foreground">
                      {selectedMatch.need.organization.name}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Contact Person</h3>
                    <p className="text-muted-foreground">
                      {selectedMatch.need.organization.contact_person}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Contact Email</h3>
                    <p className="text-muted-foreground break-all">
                      {selectedMatch.need.organization.email}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">
                      {selectedMatch.need.organization.phone || 'Not provided'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-muted-foreground">
                      {selectedMatch.need.location}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Match Score</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${selectedMatch.score.total * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.round(selectedMatch.score.total * 100)}% match
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={handleContactOrganization}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Contact Organization'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border p-6 text-center">
                <p className="text-muted-foreground">
                  Select a match to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationMatches;
