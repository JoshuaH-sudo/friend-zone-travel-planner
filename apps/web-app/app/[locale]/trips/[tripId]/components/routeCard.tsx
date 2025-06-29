import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route2, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Route {
  id: number;
  name: string;
}

interface RouteCardProps {
  route: Route;
  tripId: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const RouteCard = ({ route, tripId, isSelected = false, onSelect }: RouteCardProps) => {
  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-all duration-200 cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 shadow-lg'
      )}
      onClick={onSelect}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className={cn(
              'p-2 rounded-lg transition-colors',
              isSelected ? 'bg-blue-600' : 'bg-blue-100'
            )}>
              <Route2 className={cn(
                'h-5 w-5 transition-colors',
                isSelected ? 'text-white' : 'text-blue-600'
              )} />
            </div>
            <div>
              <h3 className='font-semibold text-foreground'>{route.name}</h3>
              <p className='text-sm text-muted-foreground'>Route #{route.id}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {isSelected && (
              <Badge variant='default' className='text-xs bg-blue-600'>
                Selected
              </Badge>
            )}
            <Badge variant='outline' className='text-xs'>
              Active
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <MapPin className='h-4 w-4' />
            <span>{isSelected ? 'Showing on map' : 'Click to view on map'}</span>
          </div>
          
          <Link href={`${tripId}/${route.id}`} onClick={(e) => e.stopPropagation()}>
            <Button variant='ghost' size='sm' className='gap-2'>
              Details
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteCard;
