/**
 * Examples of using Prisma alongside Supabase SDK
 * 
 * This file demonstrates the hybrid approach where:
 * - Supabase SDK is used for authentication, real-time features, and RLS
 * - Prisma is used for complex queries, transactions, and type-safe database operations
 */

import { prisma } from '../prisma'
import { createClient } from '../supabase/server'

// Example 1: Using Prisma for complex queries with joins
export async function getTripsWithRoutesAndDestinations(userId: string) {
  return await prisma.trip.findMany({
    where: {
      user_id: userId,
    },
    include: {
      routes: {
        include: {
          destinations: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  })
}

// Example 2: Using Prisma for transactions
export async function createTripWithRoute(userId: string, tripData: {
  name: string
  startDate: Date
  endDate: Date
  routeName: string
}) {
  return await prisma.$transaction(async (tx) => {
    // Create trip
    const trip = await tx.trip.create({
      data: {
        name: tripData.name,
        start_date: tripData.startDate,
        end_date: tripData.endDate,
        user_id: userId,
      },
    })

    // Create initial route
    const route = await tx.route.create({
      data: {
        name: tripData.routeName,
        trip_id: trip.id,
      },
    })

    return { trip, route }
  })
}

// Example 3: Using Supabase SDK for RLS-protected operations
export async function getTripsWithRLS() {
  const supabase = await createClient()
  
  // This automatically applies RLS policies
  const { data: trips, error } = await supabase
    .from('trips')
    .select(`
      *,
      routes (
        *,
        destinations (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return trips
}

// Example 4: Using Prisma for aggregations and analytics
export async function getTripStatistics(userId: string) {
  const [tripCount, routeCount, destinationCount] = await Promise.all([
    prisma.trip.count({
      where: { user_id: userId },
    }),
    prisma.route.count({
      where: {
        trip: {
          user_id: userId,
        },
      },
    }),
    prisma.destination.count({
      where: {
        route: {
          trip: {
            user_id: userId,
          },
        },
      },
    }),
  ])

  return {
    trips: tripCount,
    routes: routeCount,
    destinations: destinationCount,
  }
}

// Example 5: Using Prisma for batch operations
export async function updateDestinationOrder(routeId: string, destinationUpdates: Array<{
  id: string
  order: number
}>) {
  return await prisma.$transaction(
    destinationUpdates.map(({ id, order }) =>
      prisma.destination.update({
        where: { id },
        data: { order },
      })
    )
  )
}

// Example 6: Hybrid approach - Supabase for auth, Prisma for data
export async function createDestinationWithAuth(destinationData: {
  location: string
  latitude: number
  longitude: number
  routeId: string
  startDate: Date
  endDate: Date
}) {
  // Use Supabase to get authenticated user
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }

  // Verify user owns the route using Prisma
  const route = await prisma.route.findFirst({
    where: {
      id: destinationData.routeId,
      trip: {
        user_id: user.id,
      },
    },
  })

  if (!route) {
    throw new Error('Route not found or access denied')
  }

  // Get next order number
  const lastDestination = await prisma.destination.findFirst({
    where: { route_id: destinationData.routeId },
    orderBy: { order: 'desc' },
  })

  const nextOrder = (lastDestination?.order ?? 0) + 1

  // Create destination using Prisma
  return await prisma.destination.create({
    data: {
      location: destinationData.location,
      latitude: destinationData.latitude,
      longitude: destinationData.longitude,
      route_id: destinationData.routeId,
      start_date: destinationData.startDate,
      end_date: destinationData.endDate,
      order: nextOrder,
    },
  })
}

/**
 * When to use Prisma vs Supabase SDK:
 * 
 * Use Prisma for:
 * - Complex queries with multiple joins
 * - Transactions
 * - Type-safe database operations
 * - Aggregations and analytics
 * - Batch operations
 * - Schema migrations
 * 
 * Use Supabase SDK for:
 * - Authentication
 * - Real-time subscriptions
 * - Row Level Security (RLS) enforcement
 * - Simple CRUD operations
 * - File storage operations
 * - Edge functions
 */
