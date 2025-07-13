'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, Map, Star } from 'lucide-react';
import { TripWithRoutes } from '@/lib/hooks/useGetTripsWithRoutes';

interface TripCardProps {
  trip: TripWithRoutes;
  onViewMap: (trip: TripWithRoutes) => void;
  onRouteSelect: (trip: TripWithRoutes, routeId: string) => void;
  onTripClick: (tripId: string) => void;
  selectedRouteId: number | null;
  isMapVisible: boolean;
}

const TripCard = ({ trip, onViewMap, onRouteSelect, onTripClick, selectedRouteId, isMapVisible }: TripCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleRouteClick = (routeId: string) => {
    onRouteSelect(trip, routeId);
    if (!isMapVisible) {
      onViewMap(trip);
    }
  };

  const handleTripNameClick = () => {
    onTripClick(trip.id);
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md bg-background border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg p-2 bg-primary/10">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 
                className="text-foreground font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                onClick={handleTripNameClick}
              >
                {trip.name}
              </h3>
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
        {/* Routes List */}
        <div className="space-y-2">
          <h4 className="text-foreground font-medium text-sm">Routes</h4>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
            {trip.routes.map((route, index) => (
              <div
                key={route.id}
                className={`
                  cursor-pointer rounded-lg p-3 transition-all duration-200 border
                  ${selectedRouteId === route.id 
                    ? 'bg-primary/10 border-primary/30 shadow-sm' 
                    : 'bg-muted/30 border-muted hover:bg-muted/50'
                  }
                `}
                onClick={() => handleRouteClick(route.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {index === 0 && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <h5 className="text-foreground font-medium text-sm">
                      {route.name}
                    </h5>
                  </div>
                  {selectedRouteId === route.id && (
                    <Badge variant="default" className="text-xs bg-primary">
                      Selected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{route.destinationCount} destinations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{route.friendCount} friends</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
