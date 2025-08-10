'use client';

import { FC } from 'react';
import { ExternalLink, Plane, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import useGetFlightPrices from '../hooks/useGetFlightPrices';

export interface TransportTabProps {
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  returnDate?: string;
}

const TransportTab: FC<TransportTabProps> = ({
  fromLocation,
  toLocation,
  departureDate,
  returnDate,
}) => {
  const { data, isLoading, error, refetch } = useGetFlightPrices({
    fromLocation,
    toLocation,
    departureDate,
    returnDate,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Finding flight options...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load flight options</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="text-xs"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!data?.flights || data.flights.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No flight options found for this route</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="mt-2 text-xs"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {data.flights.map((flight, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    {flight.airline}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {flight.departure_airport} → {flight.arrival_airport}
                  </CardDescription>
                </div>
                {flight.price && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      ${flight.price}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Departure</div>
                  <div className="font-medium">{flight.departure_time}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Arrival</div>
                  <div className="font-medium">{flight.arrival_time}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-3">
                {flight.duration && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{flight.duration}</span>
                  </div>
                )}
                
                {flight.stops !== undefined && (
                  <Badge 
                    variant={flight.stops === 0 ? "default" : "secondary"}
                    className="text-xs px-2 py-0"
                  >
                    {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </Badge>
                )}
              </div>
              
              {flight.link && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  asChild
                >
                  <a 
                    href={flight.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    <span>View Details & Book</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TransportTab;

