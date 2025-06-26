
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Phone, Mail, MapPin, Clock, Package, AlertTriangle } from 'lucide-react';
import type { HospitalNeed } from '../pages/Index';

interface NeedsListProps {
  needs: HospitalNeed[];
}

export const NeedsList: React.FC<NeedsListProps> = ({ needs }) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (needs.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No current needs</h3>
        <p className="text-gray-500">All current hospital needs have been fulfilled. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {needs.map((need) => (
        <Card key={need.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg text-gray-900">{need.hospitalName}</CardTitle>
              </div>
              <Badge className={`${getUrgencyColor(need.urgency)} flex items-center space-x-1`}>
                {getUrgencyIcon(need.urgency)}
                <span className="capitalize">{need.urgency}</span>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Item Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Needed Item</h4>
              </div>
              <p className="text-lg font-medium text-blue-900">{need.item}</p>
              <p className="text-sm text-gray-600">Category: {need.category}</p>
              <p className="text-sm text-gray-600">Quantity needed: {need.quantity}</p>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </h4>
              <p className="text-sm text-gray-600">{need.contactPerson}</p>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Mail className="h-3 w-3" />
                <a 
                  href={`mailto:${need.contactEmail}`}
                  className="hover:underline"
                >
                  {need.contactEmail}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Phone className="h-3 w-3" />
                <a 
                  href={`tel:${need.contactPhone}`}
                  className="hover:underline"
                >
                  {need.contactPhone}
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{need.location}</span>
            </div>

            {/* Dropoff Instructions */}
            <div className="bg-green-50 p-3 rounded-lg">
              <h5 className="font-medium text-green-900 mb-1">Dropoff Instructions</h5>
              <p className="text-sm text-green-800">{need.dropoffInstructions}</p>
            </div>

            {/* Timestamp */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <span>Posted: {formatDate(need.timestamp)}</span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Active</span>
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
