
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

  // Sample hospital needs data - updated for pediatric focus
  const hospitalNeeds: HospitalNeed[] = [
    {
      id: '1',
      hospitalName: 'Children\'s Hospital of Philadelphia',
      contactPerson: 'Sarah Johnson',
      contactEmail: 'sarah.johnson@chop.edu',
      contactPhone: '(215) 590-1000',
      item: 'Pediatric Medical Masks',
      category: 'Medical Supplies',
      urgency: 'high',
      quantity: 500,
      location: 'Philadelphia, PA',
      dropoffInstructions: 'Main entrance, pediatric wing reception. Available 24/7. Please call ahead for pediatric ward deliveries.',
      timestamp: new Date('2024-01-15'),
    },
    {
      id: '2',
      hospitalName: 'St. Jude Children\'s Research Hospital',
      contactPerson: 'Dr. Michael Chen',
      contactEmail: 'mchen@stjude.org',
      contactPhone: '(901) 595-3300',
      item: 'Comfort Items for Young Patients',
      category: 'Comfort Items',
      urgency: 'medium',
      quantity: 100,
      location: 'Memphis, TN',
      dropoffInstructions: 'Patient services desk, Level 1. Weekdays 9 AM - 5 PM. All items must be new and unopened.',
      timestamp: new Date('2024-01-14'),
    },
    {
      id: '3',
      hospitalName: 'Boston Children\'s Hospital',
      contactPerson: 'Lisa Rodriguez',
      contactEmail: 'lrodriguez@childrens.harvard.edu',
      contactPhone: '(617) 355-6000',
      item: 'Educational Tablets for Patients',
      category: 'Technology',
      urgency: 'low',
      quantity: 25,
      location: 'Boston, MA',
      dropoffInstructions: 'Technology services, Level 3. Weekdays 8 AM - 4 PM. Devices will be sanitized before patient use.',
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/9463649d-6f3d-4f8b-aa4e-6a1f272c06f5.png" 
                alt="Kids Cancer Foundation Logo" 
                className="h-16 w-16"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Kids Cancer Foundation</h1>
                <p className="text-sm text-gray-600">Donation Matching Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Supporting Young Warriors
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-orange-100">
            Connect your donations with children's hospitals and pediatric care centers that need them most
          </p>
          <div className="flex items-center justify-center space-x-2 text-lg">
            <Heart className="h-6 w-6 text-red-300" />
            <span>Every donation brings hope to a child fighting cancer</span>
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
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Make a Donation
            </button>
            <button
              onClick={() => setActiveTab('needs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'needs'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Current Needs
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === 'matches'
                  ? 'border-orange-500 text-orange-600'
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Support Young Cancer Fighters</h3>
              <p className="text-gray-600">Help us find the perfect match for your donation to children's hospitals</p>
            </div>
            <DonationForm onSubmit={handleDonationSubmit} />
          </div>
        )}

        {activeTab === 'needs' && (
          <div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Children's Hospital Needs</h3>
              <p className="text-gray-600">See what pediatric care centers need most to support young patients</p>
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
                  ? "Wonderful! We found perfect matches to help children in need" 
                  : "No matches found yet. Submit a donation to see how you can help young cancer fighters."
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
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/lovable-uploads/9463649d-6f3d-4f8b-aa4e-6a1f272c06f5.png" 
              alt="Kids Cancer Foundation Logo" 
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold">Kids Cancer Foundation</span>
          </div>
          <p className="text-gray-400 mb-4">
            Bringing hope and healing to children battling cancer
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>Supporting pediatric care nationwide</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
