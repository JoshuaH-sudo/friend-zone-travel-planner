import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route as RouteIcon, ArrowRight, MapPin, Trash2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateRouteCosts, formatCost, routeHasCosts } from '@/lib/route-utils';
import Link from 'next/link';
import { Database } from '@/lib/supabase/database.types';

// Custom types that match the actual query result structure
// Updated Route interface to include destinations with accommodations and transports
type RouteWithDestinations = Database['public']['Tables']['routes']['Row'] & {
  destinations?: {
    id: string;
    location: string;
    latitude: number;
    longitude: number;
    order: number;
    created_at: string | null;
    updated_at: string | null;
    days: number;
    friends?: {
      id: string;
      name: string;
    }[];
    accommodations?: Database['public']['Tables']['accommodations']['Row'][];
    transports?: Database['public']['Tables']['transports']['Row'][];
  }[];
};

interface RouteCardProps {
  route: RouteWithDestinations;
  tripId: string;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete: (route: { id: string; name?: string }) => void;
}

const RouteCard = ({
  route,
  tripId,
  isSelected = false,
  onSelect,
  onDelete,
}: RouteCardProps) => {
  // Calculate route costs
  const routeCosts = calculateRouteCosts(route);
  const hasCosts = routeHasCosts(route);

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'shadow-lg ring-2 ring-blue-500 ring-offset-2'
      )}
      onClick={onSelect}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'rounded-lg p-2 transition-colors',
                isSelected ? 'bg-blue-600' : 'bg-blue-100'
              )}
            >
              <RouteIcon
                className={cn(
                  'h-5 w-5 transition-colors',
                  isSelected ? 'text-white' : 'text-blue-600'
                )}
              />
            </div>
            <div>
              <h3 className='text-foreground font-semibold'>{route.name}</h3>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {isSelected && (
              <Badge variant='default' className='bg-blue-600 text-xs'>
                Selected
              </Badge>
            )}
            <Badge variant='outline' className='text-xs'>
              Active
            </Badge>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={(e) => {
                e.stopPropagation();
                onDelete({ id: route.id, name: route.name });
              }}
              title='Delete route'
            >
              <Trash2 className='h-4 w-4 text-muted-foreground hover:text-red-600' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center gap-2 text-sm'>
            <MapPin className='h-4 w-4' />
            <span>
              {isSelected ? 'Showing on map' : 'Click to view on map'}
            </span>
          </div>

          <Link
            href={`${tripId}/${route.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant='ghost' size='sm' className='gap-2'>
              Details
              <ArrowRight className='h-4 w-4' />
            </Button>
          </Link>
        </div>

        {/* Cost Summary Section */}
        {hasCosts && routeCosts.length > 0 && (
          <div className='mt-3 pt-3 border-t border-border'>
            <div className='flex items-center gap-2 text-sm'>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
              <span className='text-muted-foreground font-medium'>Total Cost:</span>
              <div className='flex items-center gap-2 flex-wrap'>
                {routeCosts.map((cost, index) => (
                  <span
                    key={cost.currency}
                    className='text-foreground font-semibold'
                  >
                    {formatCost(cost.total, cost.currency)}
                    {index < routeCosts.length - 1 && (
                      <span className='text-muted-foreground ml-1'>•</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteCard;
