'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Calendar, Map } from 'lucide-react';
import { TripWithRoutes } from '@/lib/hooks/useGetTripsWithRoutes';
import { useState } from 'react';
import LocationMap from '../[tripId]/[routeId]/components/locationMap';

interface TripCardProps {
  trip: TripWithRoutes;
  onViewMap: (trip: TripWithRoutes) => void;
  isMapVisible: boolean;
}

const TripCard = ({ trip, onViewMap, isMapVisible }: TripCardProps) => {
  const firstRoute = trip.routes[0];
  const totalDestinations = trip.routes.reduce(
    (total, route) => total + route.destinationCount,
    0
  );
  const totalFriends = trip.routes.reduce(
    (total, route) => total + route.friendCount,
    0
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md bg-background border"
      onClick={() => onViewMap(trip)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-primary/10">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-lg">{trip.name}</h3>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {trip.routes.length} {trip.routes.length === 1 ? 'Route' : 'Routes'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* First Route Summary */}
        {firstRoute && (
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="text-foreground font-medium text-sm mb-2">
              {firstRoute.name}
            </h4>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{firstRoute.destinationCount} destinations</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{firstRoute.friendCount} friends</span>
              </div>
            </div>
          </div>
        )}

        {/* Trip Statistics */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span>Total: {totalDestinations} destinations</span>
            <span>{totalFriends} friends</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onViewMap(trip);
            }}
          >
            {isMapVisible ? 'Hide Map' : 'View Map'}
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
