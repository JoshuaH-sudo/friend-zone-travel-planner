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
  selectedRouteId: string | null;
  isMapVisible: boolean;
}

const TripCard = ({
  trip,
  onViewMap,
  onRouteSelect,
  onTripClick,
  selectedRouteId,
  isMapVisible,
}: TripCardProps) => {
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
    <Card className='bg-background border transition-all duration-200 hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 rounded-lg p-2'>
              <Map className='text-primary h-5 w-5' />
            </div>
            <div>
              <h3
                className='text-foreground hover:text-primary cursor-pointer text-lg font-semibold transition-colors'
                onClick={handleTripNameClick}
              >
                {trip.name}
              </h3>
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Calendar className='h-4 w-4' />
                <span>
                  {/* {formatDate(trip.startDate.toDateString())} -{' '}
                  {formatDate(trip.endDate.toDateString())} */}
                </span>
              </div>
            </div>
          </div>
          <Badge variant='outline' className='text-xs'>
            {/* {trip.routes.length} {trip.routes.length === 1 ? 'Route' : 'Routes'} */}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Routes List */}
        <div className='space-y-2'>
          <h4 className='text-foreground text-sm font-medium'>Routes</h4>
          <div className='max-h-48 space-y-2 overflow-y-auto pr-2'>
            {/* {trip.routes.map((route, index) => ( */}
            {[].map((route, index) => (
              <div
                key={route.id}
                className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 ${
                  selectedRouteId === route.id
                    ? 'bg-primary/10 border-primary/30 shadow-sm'
                    : 'bg-muted/30 border-muted hover:bg-muted/50'
                } `}
                onClick={() => handleRouteClick(route.id)}
              >
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {index === 0 && (
                      <Star className='h-4 w-4 fill-yellow-500 text-yellow-500' />
                    )}
                    <h5 className='text-foreground text-sm font-medium'>
                      {route.name}
                    </h5>
                  </div>
                  {selectedRouteId === route.id && (
                    <Badge variant='default' className='bg-primary text-xs'>
                      Selected
                    </Badge>
                  )}
                </div>
                <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                  <div className='flex items-center gap-1'>
                    <MapPin className='h-3 w-3' />
                    {/* <span>{route.destinations.length} destinations</span> */}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Users className='h-3 w-3' />
                    {/* <span>
                      {route.destinations
                        .map((dest) => dest.friends.length)
                        .reduce((a, b) => a + b, 0)}{' '}
                      friends
                    </span> */}
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
