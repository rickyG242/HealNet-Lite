
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Phone, Mail, MapPin, LogOut, Calendar, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been safely logged out.",
    });
    navigate('/');
  };

  const handleNeedsAssessment = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Needs assessment feature will be available soon.",
    });
  };

  const handleResourceMatching = () => {
    toast({
      title: "Feature Coming Soon", 
      description: "Resource matching feature will be available soon.",
    });
  };

  const handleDonationTracking = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Donation tracking feature will be available soon.",
    });
  };

  // Mock data for upcoming needs and recent activities
  const upcomingNeeds = [
    { id: 1, title: "Medical Equipment", priority: "High", deadline: "2024-01-15" },
    { id: 2, title: "Volunteer Staff", priority: "Medium", deadline: "2024-01-20" },
    { id: 3, title: "Educational Materials", priority: "Low", deadline: "2024-01-25" },
  ];

  const recentActivities = [
    { id: 1, action: "Received donation", item: "Medical supplies", time: "2 hours ago" },
    { id: 2, action: "Updated needs", item: "Volunteer requirements", time: "4 hours ago" },
    { id: 3, action: "Matched resources", item: "Educational books", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/9463649d-6f3d-4f8b-aa4e-6a1f272c06f5.png" 
              alt="Kids Cancer Foundation Logo" 
              className="h-12 w-12"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.organization?.contact_person || 'User'}</h1>
              <p className="text-gray-600">{user.organization?.organization_name || 'Organization'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge 
              variant={user.organization?.organization_type === 'hospital' ? 'default' : 'secondary'}
              className="px-3 py-1"
            >
              {user.organization?.organization_type === 'hospital' ? 'Hospital' : 'Partner Organization'}
            </Badge>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Organization Profile */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                <span>Organization Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.organization?.contact_person || 'Not available'}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.organization?.phone || 'Not available'}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{user.organization?.location || 'Not available'}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Joined {user.organization?.created_at ? new Date(user.organization.created_at).toLocaleDateString() : 'Unknown'}</span>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification Status</span>
                  <Badge variant={user.organization?.verified ? "default" : "destructive"}>
                    {user.organization?.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleNeedsAssessment}
                  className="flex items-center justify-center space-x-2 h-20 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Package className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Needs Assessment</div>
                    <div className="text-sm opacity-90">
                      {user.organization?.organization_type === 'hospital' ? 'Submit your needs' : 'View partner needs'}
                    </div>
                  </div>
                </Button>
                
                <Button 
                  onClick={handleResourceMatching}
                  className="flex items-center justify-center space-x-2 h-20 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Building2 className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Resource Matching</div>
                    <div className="text-sm opacity-90">Find matching resources</div>
                  </div>
                </Button>
                
                <Button 
                  onClick={handleDonationTracking}
                  className="flex items-center justify-center space-x-2 h-20 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  <Calendar className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Donation Tracking</div>
                    <div className="text-sm opacity-90">Track your contributions</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex items-center justify-center space-x-2 h-20 border-orange-200 hover:bg-orange-50"
                >
                  <User className="h-6 w-6 text-orange-600" />
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">Profile Settings</div>
                    <div className="text-sm text-orange-500">
                      {user.organization?.verified ? 'Update information' : 'Complete verification'}
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Upcoming Needs */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingNeeds.map((need) => (
                  <div key={need.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{need.title}</p>
                      <p className="text-sm text-gray-600">Due: {need.deadline}</p>
                    </div>
                    <Badge 
                      variant={need.priority === 'High' ? 'destructive' : need.priority === 'Medium' ? 'default' : 'secondary'}
                    >
                      {need.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
