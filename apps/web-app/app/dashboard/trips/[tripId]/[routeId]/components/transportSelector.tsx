'use client';

import { FC, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Plane, Train, Bus, Car, Ship, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ManualTransportForm from './manualTransportForm';

export interface TransportSelectorProps {
  fromLocation: string;
  toLocation: string;
  days: number;
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
  days,
  selectedTransport,
  onSelectTransport,
}) => {
  const [savedTransports, setSavedTransports] = useState<Array<{
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
    departureAt?: Date;
    arrivalAt?: Date;
    duration?: number;
  }>>([
    {
      name: 'Sample Airline',
      address: `${fromLocation} to ${toLocation}`,
      cost: 250,
      currency: 'USD',
      href: 'https://example.com',
      type: 'airplane',
      duration: 2.5,
    },
    {
      name: 'Budget Bus',
      address: `${fromLocation} to ${toLocation}`,
      cost: 45,
      currency: 'USD',
      href: 'https://example.com/bus',
      type: 'bus',
      duration: 5,
    }
  ]);

  const handleAddTransport = (transport: {
    name: string;
    address: string;
    cost: number;
    currency: string;
    href?: string;
    type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
    departureAt?: Date;
    arrivalAt?: Date;
    duration?: number;
  }) => {
    // Convert string time inputs to Date objects if provided
    const newTransport = {
      ...transport,
      departureAt: transport.departureTime ? new Date(`2023-01-01T${transport.departureTime}`) : undefined,
      arrivalAt: transport.arrivalTime ? new Date(`2023-01-01T${transport.arrivalTime}`) : undefined,
    };
    
    // Remove the string time properties
    delete newTransport.departureTime;
    delete newTransport.arrivalTime;
    
    setSavedTransports([...savedTransports, newTransport]);
    onSelectTransport(newTransport);
  };

  // Get icon based on transport type
  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'airplane':
        return <Plane className="h-4 w-4" />;
      case 'train':
        return <Train className="h-4 w-4" />;
      case 'bus':
        return <Bus className="h-4 w-4" />;
      case 'car':
        return <Car className="h-4 w-4" />;
      case 'ferry':
        return <Ship className="h-4 w-4" />;
      case 'other':
      default:
        return <Plane className="h-4 w-4" />;
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

  // Format time from Date object
  const formatTime = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Format duration in hours
  const formatDuration = (hours?: number): string => {
    if (!hours) return '';
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  return (
    <Tabs defaultValue="saved" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="saved">Saved Options</TabsTrigger>
        <TabsTrigger value="add">Add New</TabsTrigger>
      </TabsList>
      
      <TabsContent value="saved">
        {savedTransports.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No transport options saved yet</p>
            <p className="text-xs mt-1">Add a new transport option using the "Add New" tab</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium mb-2">Select transport:</h3>
              <RadioGroup value={selectedTransport?.name} className="gap-2">
                {savedTransports.map((transport, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <RadioGroupItem 
                      value={transport.name} 
                      id={`transport-${index}`} 
                      className="mt-1"
                      onClick={() => onSelectTransport(transport)}
                    />
                    <Label 
                      htmlFor={`transport-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      <Card className={`hover:shadow-md transition-shadow ${selectedTransport?.name === transport.name ? 'border-primary' : ''}`}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                {getTransportIcon(transport.type)}
                                {transport.name}
                              </CardTitle>
                              <div className="text-xs text-muted-foreground mt-1">
                                {transport.address}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-green-600">
                                {formatCurrency(transport.cost, transport.currency)}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {(transport.departureAt || transport.arrivalAt) && (
                            <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                              {transport.departureAt && (
                                <div>
                                  <div className="text-muted-foreground">Departure</div>
                                  <div className="font-medium">{formatTime(transport.departureAt)}</div>
                                </div>
                              )}
                              {transport.arrivalAt && (
                                <div>
                                  <div className="text-muted-foreground">Arrival</div>
                                  <div className="font-medium">{formatTime(transport.arrivalAt)}</div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mb-2">
                            {transport.duration && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(transport.duration)}</span>
                              </div>
                            )}
                            
                            {transport.href && (
                              <a 
                                href={transport.href} 
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
        <ManualTransportForm 
          onSubmit={handleAddTransport}
          fromLocation={fromLocation}
          toLocation={toLocation}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TransportSelector;
