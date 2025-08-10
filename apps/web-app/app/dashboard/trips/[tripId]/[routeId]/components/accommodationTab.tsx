'use client';

import { FC } from 'react';
import { ExternalLink, Star, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import useGetAccommodationPrices from '../hooks/useGetAccommodationPrices';

export interface AccommodationTabProps {
  location: string;
  checkInDate: string;
  checkOutDate: string;
}

const AccommodationTab: FC<AccommodationTabProps> = ({
  location,
  checkInDate,
  checkOutDate,
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

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {data.hotels.map((hotel, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
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
              {hotel.description && (
                <CardDescription className="text-xs line-clamp-2 mb-2">
                  {hotel.description}
                </CardDescription>
              )}
              
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  asChild
                >
                  <a 
                    href={hotel.link} 
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

export default AccommodationTab;

