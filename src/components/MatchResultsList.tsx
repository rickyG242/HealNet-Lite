import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { formatDistance, formatDrivingTime } from '../utils/geoUtils';
import { Clock, MapPin, Package, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface MatchResult {
  need: {
    id: string;
    item: string;
    category: string;
    quantity: number;
    urgency: 'low' | 'medium' | 'high';
    location: string;
    organization: {
      name: string;
      contact_person: string;
      phone: string;
      email: string;
    };
  };
  score: {
    total: number;
    category: number;
    distance: number;
    urgency: number;
    quantity: number;
    itemSimilarity: number;
  };
  distanceKm: number;
  drivingTimeMinutes: number;
  logisticsCost: number;
  matchQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface MatchResultsListProps {
  matches: MatchResult[];
  onSelectMatch?: (match: MatchResult) => void;
  selectedMatchId?: string | null;
  isLoading?: boolean;
}

const MatchResultsList: React.FC<MatchResultsListProps> = ({
  matches,
  onSelectMatch,
  selectedMatchId,
  isLoading = false
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getMatchQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'poor':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Info className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No matches found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">We couldn't find any matching needs at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card 
          key={match.need.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedMatchId === match.need.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onSelectMatch?.(match)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  {match.need.item}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {match.need.organization.name}
                </p>
              </div>
              <Badge 
                className={getMatchQualityColor(match.matchQuality)}
              >
                {match.matchQuality.charAt(0).toUpperCase() + match.matchQuality.slice(1)} Match
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  <span>Distance</span>
                </div>
                <div>{formatDistance(match.distanceKm)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>Drive Time</span>
                </div>
                <div>{formatDrivingTime(match.drivingTimeMinutes)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  <span>Urgency</span>
                </div>
                <Badge variant="outline" className={getUrgencyColor(match.need.urgency)}>
                  {match.need.urgency}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  <span>Quantity</span>
                </div>
                <div>{match.need.quantity} needed</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Why this match?</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category match:</span>
                  <span>{Math.round(match.score.category * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item similarity:</span>
                  <span>{Math.round(match.score.itemSimilarity * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location score:</span>
                  <span>{Math.round(match.score.distance * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Urgency score:</span>
                  <span>{Math.round(match.score.urgency * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatchResultsList;
