
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Phone, Mail, MapPin, LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/9463649d-6f3d-4f8b-aa4e-6a1f272c06f5.png" 
                alt="Kids Cancer Foundation Logo" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Organization Dashboard</h1>
                <p className="text-sm text-gray-600">Kids Cancer Foundation Platform</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user.contactPerson}!
          </h2>
          <p className="text-gray-600">
            Manage your organization's profile and access platform features.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Organization Profile */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                <span>Organization Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{user.organizationName}</h3>
                <Badge 
                  className={
                    user.organizationType === 'hospital' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }
                >
                  {user.organizationType === 'hospital' ? 'Hospital' : 'Partner Org'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{user.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Registered: {new Date(user.registrationDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${user.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {user.verified ? 'Verified Organization' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                View Donation Platform
              </Button>
              
              {user.organizationType === 'hospital' && (
                <Button 
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate('/manage-needs')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Manage Hospital Needs
                </Button>
              )}
              
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/profile-settings')}
              >
                <User className="h-4 w-4 mr-2" />
                Edit Profile Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Access Notice */}
        <Card className="mt-6 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900 mb-2">Platform Access</h4>
              <p className="text-sm text-orange-800">
                {user.verified 
                  ? 'Your organization has full access to all platform features.'
                  : 'Your account is pending verification. You currently have read-only access. Our team will review your registration within 24-48 hours.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
