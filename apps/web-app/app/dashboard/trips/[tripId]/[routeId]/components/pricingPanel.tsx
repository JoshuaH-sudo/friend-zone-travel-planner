'use client';

import { FC } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccommodationTab from './accommodationTab';
import TransportTab from './transportTab';
import { cn } from '@/lib/utils';

export interface PricingPanelProps {
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  previousDestination?: {
    location: string;
    latitude: number;
    longitude: number;
  };
  className?: string
}

const PricingPanel: FC<PricingPanelProps> = ({
  location,
  checkInDate,
  checkOutDate,
  previousDestination,
  className
}) => {
  const hasRequiredData = location && checkInDate && checkOutDate;
  const showTransportTab = hasRequiredData && previousDestination;

  if (!hasRequiredData) {
    return (
      <div className={cn("h-full", className)}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Enter destination and dates to see pricing options</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full", className)}>
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Pricing Options</h3>
        <p className="text-sm text-muted-foreground">
          Compare accommodation and transport prices for {location}
        </p>
      </div>
      
      <Tabs defaultValue="accommodation" className="w-full h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accommodation">🏨 Accommodation</TabsTrigger>
          <TabsTrigger 
            value="transport" 
            disabled={!showTransportTab}
            className={!showTransportTab ? 'opacity-50' : ''}
          >
            ✈️ Transport
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="accommodation" className="mt-4">
          <AccommodationTab
            location={location}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
          />
        </TabsContent>
        
        <TabsContent value="transport" className="mt-4">
          {showTransportTab ? (
            <TransportTab
              fromLocation={previousDestination.location}
              toLocation={location}
              departureDate={checkInDate}
            />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">
                Transport options will appear when you have a previous destination in your route
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingPanel;

