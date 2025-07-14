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
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    if (urgency === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Clock className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (needs.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No current needs</h3>
        <p className="text-muted-foreground">All current organization needs have been fulfilled. Check back later!</p>
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
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-foreground">
                  {need.organization?.organization_name || 'Organization'}
                </CardTitle>
              </div>
              <Badge className={`${getUrgencyColor(need.urgency)} flex items-center space-x-1`}>
                {getUrgencyIcon(need.urgency)}
                <span className="capitalize">{need.urgency}</span>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Item Details */}
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-foreground">Needed Item</h4>
              </div>
              <p className="text-lg font-medium text-primary">{need.item}</p>
              <p className="text-sm text-muted-foreground">Category: {need.category}</p>
              <p className="text-sm text-muted-foreground">Quantity needed: {need.quantity}</p>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Contact</span>
              </h4>
              <p className="text-sm text-muted-foreground">
                {need.organization?.contact_person || 'Contact Person'}
              </p>
              <div className="flex items-center space-x-2 text-sm text-primary">
                <Mail className="h-3 w-3" />
                <a 
                  href={`mailto:${need.organization?.email}`}
                  className="hover:underline"
                >
                  {need.organization?.email}
                </a>
              </div>
              <div className="flex items-center space-x-2 text-sm text-primary">
                <Phone className="h-3 w-3" />
                <a 
                  href={`tel:${need.organization?.phone}`}
                  className="hover:underline"
                >
                  {need.organization?.phone}
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{need.location}</span>
            </div>

            {/* Dropoff Instructions */}
            {need.dropoff_instructions && (
              <div className="bg-accent/10 p-3 rounded-lg">
                <h5 className="font-medium text-accent-foreground mb-1">Dropoff Instructions</h5>
                <p className="text-sm text-muted-foreground">{need.dropoff_instructions}</p>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Posted: {formatDate(need.created_at)}</span>
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