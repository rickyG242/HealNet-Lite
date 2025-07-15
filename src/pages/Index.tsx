import React, { useState, useEffect } from 'react';
import { DonationForm } from '../components/DonationForm';
import { NeedsList } from '../components/NeedsList';
import { MatchResults } from '../components/MatchResults';
import { Heart, HandHeart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Donation {
  id: string;
  donor_id: string;
  item: string;
  category: string;
  quantity: number;
  location: string;
  description?: string;
  status: string;
  created_at: string;
}

export interface HospitalNeed {
  id: string;
  organization_id: string;
  organization?: {
    organization_name: string;
    contact_person: string;
    email: string;
    phone: string;
    location: string;
  };
  item: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  quantity: number;
  location: string;
  dropoff_instructions?: string;
  status: string;
  created_at: string;
}

export interface Match {
  donation: Donation;
  need: HospitalNeed;
  matchScore: number;
}

const Index = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [needs, setNeeds] = useState<HospitalNeed[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'donate' | 'needs' | 'matches'>('donate');
  const [loading, setLoading] = useState(false);

  // Fetch needs from database
  useEffect(() => {
    fetchNeeds();
  }, []);

  const fetchNeeds = async () => {
    try {
      const { data, error } = await supabase
        .from('needs')
        .select(`
          *,
          organization:organizations (
            organization_name,
            contact_person,
            email,
            phone,
            location
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNeeds((data || []).map(need => ({
        ...need,
        urgency: need.urgency as 'low' | 'medium' | 'high'
      })));
    } catch (error) {
      console.error('Error fetching needs:', error);
      toast({
        title: "Error loading needs",
        description: "Could not load current needs. Please try again.",
        variant: "destructive",
      });
    }
  };

  const findMatches = (newDonation: Donation): Match[] => {
    const potentialMatches: Match[] = [];

    needs.forEach(need => {
      let score = 0;

      // Category match (highest priority)
      if (need.category.toLowerCase() === newDonation.category.toLowerCase()) {
        score += 50;
      }

      // Item name similarity
      if (need.item.toLowerCase().includes(newDonation.item.toLowerCase()) ||
          newDonation.item.toLowerCase().includes(need.item.toLowerCase())) {
        score += 30;
      }

      // Location proximity (simplified)
      if (need.location.toLowerCase() === newDonation.location.toLowerCase()) {
        score += 20;
      }

      // Urgency bonus
      if (need.urgency === 'high') score += 15;
      if (need.urgency === 'medium') score += 10;

      // Quantity consideration
      if (newDonation.quantity >= need.quantity) {
        score += 10;
      } else if (newDonation.quantity >= need.quantity * 0.5) {
        score += 5;
      }

      if (score >= 30) { // Minimum threshold for a match
        potentialMatches.push({
          donation: newDonation,
          need,
          matchScore: score,
        });
      }
    });

    return potentialMatches.sort((a, b) => b.matchScore - a.matchScore);
  };

  const handleDonationSubmit = async (donationData: {
    item: string;
    category: string;
    quantity: number;
    location: string;
    description?: string;
  }) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a donation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get user profile to get the profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw new Error('Could not find user profile');
      }

      // Insert donation into database
      const { data: donation, error } = await supabase
        .from('donations')
        .insert({
          donor_id: profileData.id,
          item: donationData.item,
          category: donationData.category,
          quantity: donationData.quantity,
          location: donationData.location,
          description: donationData.description,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setDonations(prev => [...prev, donation]);
      
      // Find matches
      const newMatches = findMatches(donation);
      setMatches(prev => [...prev, ...newMatches]);
      
      if (newMatches.length > 0) {
        setActiveTab('matches');
      }

      toast({
        title: "Donation Submitted Successfully!",
        description: "We're now searching for the best matches for your generous donation.",
      });

    } catch (error) {
      console.error('Error submitting donation:', error);
      toast({
        title: "Error submitting donation",
        description: "Could not submit your donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/9463649d-6f3d-4f8b-aa4e-6a1f272c06f5.png" 
                alt="HealNet Lite Logo" 
                className="h-16 w-16 mix-blend-multiply dark:mix-blend-screen filter drop-shadow-none"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div>
                <h1 className="text-3xl font-bold text-purple-900">HealNet Lite</h1>
                <p className="text-sm text-purple-600">Donation Matching Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                    Sign In
                  </Link>
                  <Link to="/register">
                    <Button className="bg-primary hover:bg-primary/90">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Connecting Hearts, Healing Lives
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-purple-100">
            Connect your donations with organizations that need them most
          </p>
          <div className="flex items-center justify-center space-x-2 text-lg">
            <Heart className="h-6 w-6 text-pink-300" />
            <span>Every donation makes a difference</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('donate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'donate'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Make a Donation
            </button>
            <button
              onClick={() => setActiveTab('needs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'needs'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Current Needs
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'matches'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Matches Found
              {matches.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {matches.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'donate' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Make a Donation</h3>
              <p className="text-muted-foreground">Help us find the perfect match for your generous donation</p>
            </div>
            <DonationForm onSubmit={handleDonationSubmit} loading={loading} />
          </div>
        )}

        {activeTab === 'needs' && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Current Needs</h3>
              <p className="text-muted-foreground">See what organizations need most to support their communities</p>
            </div>
            <NeedsList needs={needs} />
          </div>
        )}

        {activeTab === 'matches' && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Your Donation Matches</h3>
              <p className="text-muted-foreground">
                {matches.length > 0 
                  ? "Wonderful! We found perfect matches to help communities in need" 
                  : "No matches found yet. Submit a donation to see how you can help."
                }
              </p>
            </div>
            <MatchResults matches={matches} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card text-card-foreground py-12 mt-16 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/lovable-uploads/9463649d-6f3d-4f8b-aa4e-6a1f272c06f5.png" 
              alt="HealNet Lite Logo" 
              className="h-8 w-8 mix-blend-multiply dark:mix-blend-screen filter drop-shadow-none"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-xl font-semibold">HealNet Lite</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Connecting donations with those who need them most
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Supporting communities nationwide</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;