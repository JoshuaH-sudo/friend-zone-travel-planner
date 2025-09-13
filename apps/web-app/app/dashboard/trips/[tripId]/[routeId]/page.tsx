import { TripRouteParams } from '../page';
import RouteClientWrapper from './components/routeClientWrapper';

export type RouteParams = TripRouteParams & {
  tripId: string;
  routeId: string;
};

export type RoutePageProps = {
  params: Promise<RouteParams>;
};

export default async function NewRoutePage({ params }: RoutePageProps) {
  const { tripId, routeId } = await params;

  return (
    <RouteClientWrapper
      tripId={tripId}
      routeId={routeId}
    />
  );
}
