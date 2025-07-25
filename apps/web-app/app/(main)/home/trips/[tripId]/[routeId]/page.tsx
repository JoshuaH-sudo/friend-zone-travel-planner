import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth-utils'
import { notFound } from 'next/navigation'
import { TripRouteParams } from '../page'
import AddDestinationForm from './components/addDestinationForm'
import DestinationList from './components/destinationsList'
import LocationMap from './components/locationMap'
import RouteNameInput from './components/routeNameInput'

export type RouteParams = TripRouteParams & {
  routeId: string;
};

export type RoutePageProps = {
  params: Promise<RouteParams>;
};

export default async function NewRoutePage({ params }: RoutePageProps) {
  const { routeId } = await params;
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
    notFound()
  }

  // Fetch route with verification that it belongs to a trip owned by the user
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select(`
      *,
      trips!inner (
        id,
        name,
        user_id
      )
    `)
    .eq('id', routeId)
    .eq('trips.user_id', userId)
    .single()

  if (routeError || !route) {
    notFound()
  }

  return (
    <div className='min-h-screen sm:h-[600px]'>
      <div
        id='route-name-section'
        className='mb-4 flex flex-row items-end justify-between gap-2'
      >
        <div className='grow space-y-2'>
          <RouteNameInput routeId={routeId} initialName={route.name} />
        </div>
      </div>
      <div
        id='trip-details'
        className='flex h-2/3 flex-col justify-between gap-4 sm:flex-row sm:items-start sm:justify-center'
      >
        <div
          id='route-list'
          className='bg-card h-1/3 rounded-lg border p-2 sm:h-full sm:w-[30%]'
        >
          <DestinationList routeId={routeId} />
        </div>

        <div
          id='destination-details'
          className='bg-card flex h-2/3 w-full flex-col gap-4 rounded-lg border p-2 sm:h-full sm:w-[30%]'
        >
          <AddDestinationForm routeId={routeId} />
        </div>

        <div
          id='map-overview'
          className='bg-card h-1/3 w-full max-w-xl rounded-lg border sm:h-full'
        >
          <LocationMap routeId={routeId} />
        </div>
      </div>
    </div>
  );
}

