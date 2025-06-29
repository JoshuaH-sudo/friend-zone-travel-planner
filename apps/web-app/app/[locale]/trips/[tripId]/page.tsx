import prisma from '@/lib/db';
import { DUMMY_LOGIN_USER_ID } from '@/lib/constants';
import CreateRouteButton from './components/createRouteButton';
import RouteCard from './components/routeCard';
import TripHeader from './components/tripHeader';
import MapPlaceholder from './components/mapPlaceholder';

export type TripRouteParams = {
  locale: string;
  tripId: string;
};
export type TripPageProps = {
  params: Promise<TripRouteParams>;
};

export default async function TripDetails({
  params,
}: {
  params: Promise<TripRouteParams>;
}) {
  const { tripId } = await params;
  const trip = await prisma.trip.findFirst({
    where: {
      userId: DUMMY_LOGIN_USER_ID,
      id: parseInt(tripId, 10),
    },
  });
  const routes = await prisma.route.findMany({
    where: {
      tripId: parseInt(tripId, 10),
    },
  });

  if (!trip) {
    return <div className='text-red-500'>Trip not found</div>;
  }

  return (
    <main className='min-h-screen bg-gray-50'>
      {/* Header */}
      <TripHeader trip={trip} />
      
      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Routes */}
          <div className='lg:col-span-2 space-y-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-900'>Routes</h2>
              <CreateRouteButton tripId={tripId} />
            </div>
            
            {routes.length > 0 ? (
              <div className='grid gap-4'>
                {routes.map((route) => (
                  <RouteCard 
                    key={route.id} 
                    route={route} 
                    tripId={tripId} 
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-12 bg-white rounded-lg border border-gray-200'>
                <p className='text-gray-500 mb-4'>No routes added yet</p>
                <CreateRouteButton tripId={tripId} />
              </div>
            )}
          </div>
          
          {/* Right Column - Map */}
          <div className='lg:col-span-1'>
            <MapPlaceholder />
          </div>
        </div>
      </div>
    </main>
  );
}
