import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TripRouteParams } from '../page';
import AddDestinationForm from './components/addDestinationForm';
import DestinationList from './components/destinationsList';
import LocationMap from './components/locationMap';

export type RouteParams = TripRouteParams & {
  routeId: string;
};
export type RoutePageProps = {
  params: Promise<RouteParams>;
};
export default async function NewRoutePage({ params }: RoutePageProps) {
  const { routeId } = await params;

  return (
    <div className='min-h-screen sm:h-[600px]'>
      <div
        id='route-name-section'
        className='mb-4 flex flex-row items-end justify-between gap-2'
      >
        <div className='grow space-y-2'>
          <Label htmlFor='route-name'>Route Name</Label>
          <Input
            id='route-name'
            value={'Berlin Trip'}
            placeholder={'Enter route name'}
            className='max-w-md'
          />
        </div>
      </div>
      <div
        id='trip-details'
        className='flex h-2/3 flex-col justify-between gap-4 sm:flex-row sm:items-start sm:justify-center'
      >
        <div
          id='route-list'
          className='h-1/3 bg-gray-500 p-2 sm:h-full sm:w-[30%]'
        >
          <DestinationList routeId={parseInt(routeId, 10)} />
        </div>

        <div
          id='destination-details'
          className='flex h-2/3 w-full flex-col gap-4 bg-gray-500 p-2 sm:h-full sm:w-[30%]'
        >
          <AddDestinationForm routeId={parseInt(routeId, 10)} />
        </div>

        <div
          id='map-overview'
          className='h-1/3 w-full max-w-xl bg-blue-500 sm:h-full'
        >
          <LocationMap routeId={parseInt(routeId, 10)} />
        </div>
      </div>
    </div>
  );
}
