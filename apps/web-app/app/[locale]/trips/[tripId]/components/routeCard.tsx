import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route as RouteIcon, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Route } from '@prisma/client';

interface RouteCardProps {
  route: Route;
  tripId: string;
}

const RouteCard = ({ route, tripId }: RouteCardProps) => {
  return (
    <Card className='transition-shadow duration-200 hover:shadow-md'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='rounded-lg bg-blue-100 p-2'>
              <RouteIcon className='h-5 w-5 text-blue-600' />
            </div>
            <div>
              <h3 className='font-semibold text-foreground'>{route.name}</h3>
              <p className='text-sm text-muted-foreground'>Route #{route.id}</p>
            </div>
          </div>
          <Badge variant='outline' className='text-xs'>
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <MapPin className='h-4 w-4' />
            <span>View destinations</span>
          </div>

          <Link href={`${tripId}/${route.id}`}>
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
