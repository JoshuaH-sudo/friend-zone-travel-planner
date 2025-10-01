'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Edit, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { TripByIdResponse } from '../../actions/getTripById';
import DeleteRouteDialog from './DeleteRouteDialog';

type Route = TripByIdResponse['routes'][0];
export interface RoutesListProps {
  routes: TripByIdResponse['routes'];
  selectedRoute: Route | null;
  onRouteSelect: (routeId: Route | null) => void;
}

const RoutesList: FC<RoutesListProps> = ({ routes, onRouteSelect }) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [deletingRoute, setDeletingRoute] = useState<Route | null>(null);

  const onItemClick = (route: TripByIdResponse['routes'][0]) => {
    if (selectedRouteId === route.id) {
      setSelectedRouteId(null);
      onRouteSelect(null);
      return;
    }

    setSelectedRouteId(route.id);
    onRouteSelect(route);
  };

  const handleDeleteRoute = (route: Route) => {
    setDeletingRoute(route);
  };

  return (
    <>
      <ScrollArea className='h-full py-2'>
        {routes.map((route, index) => (
          <div key={route.id} className='flex flex-col items-center'>
            <div
              className='group relative flex w-full flex-row items-center gap-2'
              onClick={() => onItemClick(route)}
            >
              <div className='flex size-8 items-center justify-center rounded-full bg-gray-200 text-black'>
                {index + 1}
              </div>

              <div
                id='destination-card'
                className={`flex flex-1 cursor-pointer flex-row gap-2 rounded-lg p-2 px-4 text-sm transition-all duration-300 ease-in-out group-hover:mr-20 ${
                  selectedRouteId === route.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : selectedRouteId
                      ? 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      : 'bg-gray-200 text-black hover:bg-blue-400'
                }`}
              >
                <p className='flex-1 font-medium'>{route.name}</p>
                <p>
                  {format(route.date_from!, 'MMM d')} -{' '}
                  {format(route.date_to!, 'MMM d')}
                </p>
              </div>

              <div
                id='action-buttons'
                className='absolute right-1 flex gap-1 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100'
              >
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 bg-white shadow-sm hover:bg-blue-400'
                  title='Edit destination'
                >
                  <Edit className='h-4 w-4 text-gray-600' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 bg-white shadow-sm hover:bg-blue-400'
                  onClick={() => handleDeleteRoute(route)}
                  title='Delete destination'
                >
                  <Trash2 className='h-4 w-4 text-gray-600 hover:text-red-600' />
                </Button>
              </div>
            </div>
            {index < route.destinations.length - 1 && (
              <ChevronDown
                key={`dot-${index}`}
                className='mx-auto size-6 text-black'
              />
            )}
          </div>
        ))}
      </ScrollArea>
      <DeleteRouteDialog
        route={deletingRoute}
        open={!!deletingRoute}
        onOpenChange={(open) => !open && setDeletingRoute(null)}
      />
    </>
  );
};

export default RoutesList;
