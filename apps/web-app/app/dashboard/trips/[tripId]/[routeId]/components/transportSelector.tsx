'use client';

import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Plane, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useGetFlightPrices from '../hooks/useGetFlightPrices';

export interface TransportSelectorProps {
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  returnDate?: string;
  selectedTransport: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
    departureAt?: Date;
    arrivalAt?: Date;
    duration?: number;
  } | null;
  onSelectTransport: (transport: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
    departureAt?: Date;
    arrivalAt?: Date;
    duration?: number;
  }) => void;
}

const TransportSelector: FC<TransportSelectorProps> = ({
  fromLocation,
  toLocation,
  departureDate,
  returnDate,
  selectedTransport,
  onSelectTransport,
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
          <span className="text-sm">Finding transport options...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load transport options</span>
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
        <p className="text-sm">No transport options found for this route</p>
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

  // Extract price value from string (e.g., "$120" -> 120)
  const extractPrice = (priceString?: string): number => {
    if (!priceString) return 0;
    const match = priceString.match(/[\d,]+(\.\d+)?/);
    if (!match) return 0;
    return parseFloat(match[0].replace(/,/g, ''));
  };

  // Extract currency from string (e.g., "$120" -> "USD")
  const extractCurrency = (priceString?: string): string => {
    if (!priceString) return 'USD';
    if (priceString.startsWith('$')) return 'USD';
    if (priceString.startsWith('€')) return 'EUR';
    if (priceString.startsWith('£')) return 'GBP';
    if (priceString.startsWith('¥')) return 'JPY';
    if (priceString.startsWith('A$')) return 'AUD';
    if (priceString.startsWith('C$')) return 'CAD';
    return 'USD';
  };

  // Parse time string to Date object
  const parseTimeString = (dateStr: string, timeStr: string): Date | undefined => {
    if (!dateStr || !timeStr) return undefined;
    
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date(dateStr);
      date.setHours(hours, minutes);
      return date;
    } catch (error) {
      console.error('Error parsing time string:', error);
      return undefined;
    }
  };

  // Parse duration string to hours (e.g., "2h 30m" -> 2.5)
  const parseDuration = (durationStr: string): number | undefined => {
    if (!durationStr) return undefined;
    
    try {
      const hoursMatch = durationStr.match(/(\d+)h/);
      const minutesMatch = durationStr.match(/(\d+)m/);
      
      const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
      
      return hours + (minutes / 60);
    } catch (error) {
      console.error('Error parsing duration string:', error);
      return undefined;
    }
  };

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium mb-2">Select transport:</h3>
        <RadioGroup value={selectedTransport?.name} className="gap-2">
          {data.flights.map((flight, index) => (
            <div key={index} className="flex items-start space-x-2">
              <RadioGroupItem 
                value={flight.airline || ''} 
                id={`flight-${index}`} 
                className="mt-1"
                onClick={() => onSelectTransport({
                  name: flight.airline || 'Unknown Airline',
                  address: `${flight.departure_airport} to ${flight.arrival_airport}`,
                  cost: extractPrice(flight.price),
                  currency: extractCurrency(flight.price),
                  href: flight.link,
                  type: 'airplane',
                  departureAt: parseTimeString(departureDate, flight.departure_time),
                  arrivalAt: parseTimeString(departureDate, flight.arrival_time),
                  duration: parseDuration(flight.duration),
                })}
              />
              <Label 
                htmlFor={`flight-${index}`}
                className="flex-1 cursor-pointer"
              >
                <Card className={`hover:shadow-md transition-shadow ${selectedTransport?.name === flight.airline ? 'border-primary' : ''}`}>
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
                            {flight.price}
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
                    
                    <div className="flex items-center justify-between mb-2">
                      {flight.duration && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{flight.duration}</span>
                        </div>
                      )}
                      
                      {flight.link && (
                        <a 
                          href={flight.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </ScrollArea>
  );
};

export default TransportSelector;

