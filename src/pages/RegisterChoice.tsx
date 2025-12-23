import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, User, ArrowRight } from 'lucide-react';

const RegisterChoice = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/9463649d-6f3d-4f8b-aa4e-6a1f272c06f5.png" 
            alt="HealNet Logo" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Join Our Platform</h1>
          <p className="text-gray-600">Choose your account type to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                <span>Organization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-grow flex flex-col">
              <p className="text-gray-600 mb-6">
                Register as a hospital or partner organization to post needs and receive donations.
              </p>
              <div className="mt-auto">
                <Link to="/register/organization" className="w-full">
                  <Button className="w-full">
                    Register as Organization
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
              <CardTitle className="flex items-center justify-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <span>Individual Donor</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-grow flex flex-col">
              <p className="text-gray-600 mb-6">
                Register as an individual donor to browse needs and make donations.
              </p>
              <div className="mt-auto">
                <Link to="/register/donor" className="w-full">
                  <Button className="w-full" variant="outline">
                    Register as Donor
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-600 hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterChoice;
