import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Navigation } from 'lucide-react';

const MapPlaceholder = () => {
  return (
    <div className='space-y-4'>
      {/* Map Card */}
      <Card className='h-96'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Map className='h-5 w-5' />
            Route Map
          </CardTitle>
        </CardHeader>
        <CardContent className='flex-1 flex items-center justify-center'>
          <div className='text-center text-gray-500'>
            <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center'>
              <Navigation className='h-12 w-12 text-gray-400' />
            </div>
            <p className='text-sm'>Interactive map will be displayed here</p>
            <p className='text-xs text-gray-400 mt-1'>
              Showing all routes and destinations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trip Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Trip Overview</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='text-center p-3 bg-blue-50 rounded-lg'>
              <div className='font-semibold text-blue-900'>0</div>
              <div className='text-blue-700'>Total Routes</div>
            </div>
            <div className='text-center p-3 bg-green-50 rounded-lg'>
              <div className='font-semibold text-green-900'>0</div>
              <div className='text-green-700'>Destinations</div>
            </div>
          </div>
          
          <div className='pt-2 border-t border-gray-200'>
            <div className='text-xs text-gray-500 mb-2'>Quick Actions</div>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2 text-gray-600'>
                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                <span>View all destinations</span>
              </div>
              <div className='flex items-center gap-2 text-gray-600'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span>Export itinerary</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapPlaceholder;
