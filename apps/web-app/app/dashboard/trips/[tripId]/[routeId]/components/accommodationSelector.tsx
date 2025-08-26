'use client';

import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Building, Bed, Home, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManualAccommodationForm from './manualAccommodationForm';

export interface AccommodationSelectorProps {
  location: string;
  days: number;
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
  days,
  selectedAccommodation,
  onSelectAccommodation,
}) => {
  const [savedAccommodations, setSavedAccommodations] = useState<Array<{
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other';
  }>>([
    {
      name: 'Sample Hotel',
      address: location,
      cost: 120,
      currency: 'USD',
      href: 'https://example.com',
      type: 'hotel',
    },
    {
      name: 'Budget Hostel',
      address: location,
      cost: 45,
      currency: 'USD',
      href: 'https://example.com/hostel',
      type: 'hostel',
    }
  ]);

  const handleAddAccommodation = (accommodation: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'hotel' | 'motel' | 'hostel' | 'friend' | 'airbnb' | 'other';
  }) => {
    setSavedAccommodations([...savedAccommodations, accommodation]);
    onSelectAccommodation(accommodation);
  };

  // Get icon based on accommodation type
  const getAccommodationIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Building className="h-4 w-4" />;
      case 'hostel':
        return <Bed className="h-4 w-4" />;
      case 'friend':
        return <Users className="h-4 w-4" />;
      case 'airbnb':
      case 'motel':
      case 'other':
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  // Format currency display
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  };

  return (
    <Tabs defaultValue="saved" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="saved">Saved Options</TabsTrigger>
        <TabsTrigger value="add">Add New</TabsTrigger>
      </TabsList>
      
      <TabsContent value="saved">
        {savedAccommodations.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No accommodation options saved yet</p>
            <p className="text-xs mt-1">Add a new accommodation using the "Add New" tab</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Select accommodation:</h3>
              <RadioGroup value={selectedAccommodation?.name} className="gap-2">
                {savedAccommodations.map((accommodation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <RadioGroupItem 
                      value={accommodation.name} 
                      id={`accommodation-${index}`} 
                      className="mt-1"
                      onClick={() => onSelectAccommodation(accommodation)}
                    />
                    <Label 
                      htmlFor={`accommodation-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      <Card className={`hover:shadow-md transition-shadow ${selectedAccommodation?.name === accommodation.name ? 'border-primary' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-medium line-clamp-1 flex items-center gap-1">
                                {getAccommodationIcon(accommodation.type)}
                                {accommodation.name}
                              </CardTitle>
                              <div className="text-xs text-muted-foreground mt-1">
                                {accommodation.address}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">
                                {formatCurrency(accommodation.cost, accommodation.currency)}
                              </div>
                              <div className="text-xs text-muted-foreground">per night</div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {accommodation.type.charAt(0).toUpperCase() + accommodation.type.slice(1)}
                            </div>
                            
                            {accommodation.href && (
                              <a 
                                href={accommodation.href} 
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
        )}
      </TabsContent>
      
      <TabsContent value="add">
        <ManualAccommodationForm 
          onSubmit={handleAddAccommodation}
          location={location}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AccommodationSelector;
