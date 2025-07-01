'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { DUMMY_LOGIN_USER_ID } from '@/lib/constants';
import useGetTripsWithRoutes, { TripWithRoutes } from '@/lib/hooks/useGetTripsWithRoutes';
import TripCard from './TripCard';
import TripMapView from './TripMapView';

const TripsPageClient = () => {
  const [selectedTrip, setSelectedTrip] = useState<TripWithRoutes | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const { data: trips = [], isLoading, error } = useGetTripsWithRoutes(DUMMY_LOGIN_USER_ID);

  const handleViewMap = (trip: TripWithRoutes) => {
    if (selectedTrip?.id === trip.id) {
      setSelectedTrip(null);
      setSelectedRouteId(null);
    } else {
      setSelectedTrip(trip);
      // Default to first route if no route is selected
      if (!selectedRouteId && trip.routes.length > 0) {
        setSelectedRouteId(trip.routes[0].id);
      }
    }
  };

  const handleRouteSelect = (trip: TripWithRoutes, routeId: number) => {
    setSelectedTrip(trip);
    setSelectedRouteId(routeId);
  };

  const handleCreateNewTrip = () => {
    // TODO: Implement create new trip functionality
    console.log('Create new trip clicked');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Trips</h1>
            <p className="text-muted-foreground">
              There was an error loading your trips. Please try again later.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Trips</h1>
            <p className="text-muted-foreground">
              Manage your travel plans and explore destinations with friends
            </p>
          </div>
          <Button onClick={handleCreateNewTrip} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Trip
          </Button>
        </div>

        {trips.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No trips yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start planning your next adventure by creating your first trip. 
              Add destinations and invite friends to join you!
            </p>
            <Button onClick={handleCreateNewTrip} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Trip
            </Button>
          </div>
        ) : (
          /* Trips Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Trip Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  All Trips ({trips.length})
                </h2>
              </div>
              
              <div className="space-y-4">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onViewMap={handleViewMap}
                    onRouteSelect={handleRouteSelect}
                    selectedRouteId={selectedTrip?.id === trip.id ? selectedRouteId : null}
                    isMapVisible={selectedTrip?.id === trip.id}
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              {selectedTrip ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Preview</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTrip(null);
                        setSelectedRouteId(null);
                      }}
                    >
                      Close Preview
                    </Button>
                  </div>
                  <div className="h-[500px] relative">
                    <TripMapView trip={selectedTrip} selectedRouteId={selectedRouteId} />
                  </div>
                </div>
              ) : (
                <div className="h-[500px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select a route to preview
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Click on any route in a trip card to see its destinations on the map
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default TripsPageClient;
