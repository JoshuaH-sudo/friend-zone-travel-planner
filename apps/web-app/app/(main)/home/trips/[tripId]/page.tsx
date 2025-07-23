import { createClient } from '@/lib/supabase/server'
import { getCurrentUserId } from '@/lib/auth-utils'
import { notFound } from 'next/navigation'

interface TripPageProps {
  params: {
    tripId: string
  }
}

export default async function TripPage({ params }: TripPageProps) {
  const supabase = await createClient()
  const userId = await getCurrentUserId()

  if (!userId) {
    notFound()
  }

  // Fetch trip with verification that it belongs to the user
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('*')
    .eq('id', params.tripId)
    .eq('user_id', userId)
    .single()

  if (tripError || !trip) {
    notFound()
  }

  // Fetch routes for this trip
  const { data: routes, error: routesError } = await supabase
    .from('routes')
    .select(`
      *,
      destinations (*)
    `)
    .eq('trip_id', params.tripId)
    .order('created_at', { ascending: true })

  if (routesError) {
    console.error('Error fetching routes:', routesError)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{trip.name}</h1>
        <p className="text-muted-foreground">
          {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Routes</h2>
        
        {routes && routes.length > 0 ? (
          <div className="grid gap-4">
            {routes.map((route) => (
              <div key={route.id} className="border rounded-lg p-4">
                <h3 className="text-xl font-medium">{route.name}</h3>
                {route.destinations && route.destinations.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground">
                      {route.destinations.length} destination{route.destinations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No routes created yet.</p>
        )}
      </div>
    </div>
  )
}

