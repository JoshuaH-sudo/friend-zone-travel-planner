'use client';
import { useQuery } from '@tanstack/react-query';

export interface TripWithRoutes {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  routes: {
    id: number;
    name: string;
    destinationCount: number;
    friendCount: number;
    destinations: {
      id: number;
      location: string;
      latitude: number;
      longitude: number;
      order: number;
    }[];
  }[];
}

const useGetTripsWithRoutes = (userId: number) => {
  return useQuery({
    queryKey: ['trips', userId],
    queryFn: async (): Promise<TripWithRoutes[]> => {
      const response = await fetch(`/api/trips?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      return response.json();
    },
  });
};

export default useGetTripsWithRoutes;
