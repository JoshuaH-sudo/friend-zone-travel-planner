import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth-utils'
import { notFound } from 'next/navigation'

interface RoutePageProps {
  params: {
    tripId: string
    routeId: string
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
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
      ),
      destinations (*)
    `)
    .eq('id', params.routeId)
    .eq('trips.user_id', userId)
    .single()

  if (routeError || !route) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{route.name}</h1>
        <p className="text-muted-foreground">
          Part of trip: {route.trips.name}
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Destinations</h2>
        
        {route.destinations && route.destinations.length > 0 ? (
          <div className="grid gap-4">
            {route.destinations
              .sort((a, b) => a.order - b.order)
              .map((destination) => (
                <div key={destination.id} className="border rounded-lg p-4">
                  <h3 className="text-xl font-medium">{destination.location}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(destination.start_date).toLocaleDateString()} - {new Date(destination.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Coordinates: {destination.latitude}, {destination.longitude}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No destinations added yet.</p>
        )}
      </div>
    </div>
  )
}

