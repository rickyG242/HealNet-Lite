
import React, { useState } from 'react';
import { DonationForm } from '../components/DonationForm';
import { NeedsList } from '../components/NeedsList';
import { MatchResults } from '../components/MatchResults';
import { Heart, HandHeart, MapPin } from 'lucide-react';

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  item: string;
  category: string;
  quantity: number;
  location: string;
  description: string;
  timestamp: Date;
}

export interface HospitalNeed {
  id: string;
  hospitalName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  item: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  quantity: number;
  location: string;
  dropoffInstructions: string;
  timestamp: Date;
}

export interface Match {
  donation: Donation;
  need: HospitalNeed;
  matchScore: number;
}

const Index = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<'donate' | 'needs' | 'matches'>('donate');

  // Sample hospital needs data
  const hospitalNeeds: HospitalNeed[] = [
    {
      id: '1',
      hospitalName: 'City General Hospital',
      contactPerson: 'Sarah Johnson',
      contactEmail: 'sarah.johnson@citygeneral.org',
      contactPhone: '(555) 123-4567',
      item: 'Medical Masks',
      category: 'Medical Supplies',
      urgency: 'high',
      quantity: 500,
      location: 'Downtown District',
      dropoffInstructions: 'Main entrance, security desk. Available 24/7. Please call ahead.',
      timestamp: new Date('2024-01-15'),
    },
    {
      id: '2',
      hospitalName: 'Children\'s Medical Center',
      contactPerson: 'Dr. Michael Chen',
      contactEmail: 'mchen@childrenscenter.org',
      contactPhone: '(555) 234-5678',
      item: 'Baby Formula',
      category: 'Food & Nutrition',
      urgency: 'medium',
      quantity: 50,
      location: 'Westside',
      dropoffInstructions: 'Pediatric wing, Level 2. Weekdays 9 AM - 5 PM only.',
      timestamp: new Date('2024-01-14'),
    },
    {
      id: '3',
      hospitalName: 'Regional Trauma Center',
      contactPerson: 'Lisa Rodriguez',
      contactEmail: 'lrodriguez@regionaltrauma.org',
      contactPhone: '(555) 345-6789',
      item: 'Blankets',
      category: 'Comfort Items',
      urgency: 'low',
      quantity: 100,
      location: 'North District',
      dropoffInstructions: 'Loading dock B, rear entrance. Weekdays 8 AM - 4 PM.',
      timestamp: new Date('2024-01-13'),
    },
  ];

  const findMatches = (newDonation: Donation): Match[] => {
    const potentialMatches: Match[] = [];

    hospitalNeeds.forEach(need => {
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

  const handleDonationSubmit = (donation: Omit<Donation, 'id' | 'timestamp'>) => {
    const newDonation: Donation = {
      ...donation,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setDonations(prev => [...prev, newDonation]);
    
    const newMatches = findMatches(newDonation);
    setMatches(prev => [...prev, ...newMatches]);
    
    if (newMatches.length > 0) {
      setActiveTab('matches');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-full">
                <HandHeart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CareConnect</h1>
                <p className="text-sm text-gray-600">Connecting donors with those in need</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Every Donation Matters
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Instantly match your donations with hospitals and organizations that need them most
          </p>
          <div className="flex items-center justify-center space-x-2 text-lg">
            <Heart className="h-6 w-6 text-red-300" />
            <span>Making a difference, one donation at a time</span>
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
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Make a Donation
            </button>
            <button
              onClick={() => setActiveTab('needs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'needs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Current Needs
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'matches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Matches Found
              {matches.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Donation</h3>
              <p className="text-gray-600">Help us find the perfect match for your generous donation</p>
            </div>
            <DonationForm onSubmit={handleDonationSubmit} />
          </div>
        )}

        {activeTab === 'needs' && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Current Hospital Needs</h3>
              <p className="text-gray-600">See what our partner organizations need most right now</p>
            </div>
            <NeedsList needs={hospitalNeeds} />
          </div>
        )}

        {activeTab === 'matches' && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Donation Matches</h3>
              <p className="text-gray-600">
                {matches.length > 0 
                  ? "Great news! We found perfect matches for your donations" 
                  : "No matches found yet. Submit a donation to see potential matches."
                }
              </p>
            </div>
            <MatchResults matches={matches} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <HandHeart className="h-6 w-6" />
            <span className="text-xl font-semibold">CareConnect</span>
          </div>
          <p className="text-gray-400 mb-4">
            Connecting generous hearts with those who need support most
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>Serving communities nationwide</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
