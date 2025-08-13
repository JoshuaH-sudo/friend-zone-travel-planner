'use client';

import { FC, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Star, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useGetAccommodationPrices from '../hooks/useGetAccommodationPrices';

export interface AccommodationSelectorProps {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  selectedAccommodation: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other';
  } | null;
  onSelectAccommodation: (accommodation: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other';
  }) => void;
}

const AccommodationSelector: FC<AccommodationSelectorProps> = ({
  location,
  checkInDate,
  checkOutDate,
  selectedAccommodation,
  onSelectAccommodation,
}) => {
  const { data, isLoading, error, refetch } = useGetAccommodationPrices({
    location,
    checkInDate,
    checkOutDate,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Finding accommodation options...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load accommodation options</span>
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

  if (!data?.hotels || data.hotels.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No accommodation options found for this location</p>
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

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium mb-2">Select accommodation:</h3>
        <RadioGroup value={selectedAccommodation?.name} className="gap-2">
          {data.hotels.map((hotel, index) => (
            <div key={index} className="flex items-start space-x-2">
              <RadioGroupItem 
                value={hotel.name || ''} 
                id={`hotel-${index}`} 
                className="mt-1"
                onClick={() => onSelectAccommodation({
                  name: hotel.name || 'Unknown Hotel',
                  address: location,
                  cost: extractPrice(hotel.price),
                  currency: extractCurrency(hotel.price),
                  href: hotel.link,
                  type: 'hotel',
                })}
              />
              <Label 
                htmlFor={`hotel-${index}`}
                className="flex-1 cursor-pointer"
              >
                <Card className={`hover:shadow-md transition-shadow ${selectedAccommodation?.name === hotel.name ? 'border-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium line-clamp-1">
                          {hotel.name}
                        </CardTitle>
                        {hotel.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">
                              {hotel.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      {hotel.price && (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">
                            {hotel.price}
                          </div>
                          <div className="text-xs text-muted-foreground">per night</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {hotel.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                          <Badge 
                            key={amenityIndex} 
                            variant="secondary" 
                            className="text-xs px-2 py-0"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {hotel.link && (
                      <a 
                        href={hotel.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View Details</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
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

export default AccommodationSelector;

