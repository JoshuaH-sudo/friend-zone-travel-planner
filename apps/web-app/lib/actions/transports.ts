'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface CreateTransportData {
  destinationId: string;
  name: string;
  address: string;
  cost: number;
  currency: string;
  href?: string;
  type: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
  departureAt?: Date;
  arrivalAt?: Date;
  duration?: number;
}

export interface TransportData {
  id: string;
  destinationId: string;
  name: string;
  address: string;
  cost: number;
  currency: string;
  href?: string;
  type: string;
  departureAt?: Date;
  arrivalAt?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function createTransport(data: CreateTransportData): Promise<TransportData> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the destination belongs to a route in a trip owned by the user
  const { data: destination, error: destinationError } = await supabase
    .from('destinations')
    .select(`
      id,
      routes!inner (
        id,
        trips!inner (
          id,
          user_id
        )
      )
    `)
    .eq('id', data.destinationId)
    .eq('routes.trips.user_id', user.id)
    .single();

  if (destinationError || !destination) {
    throw new Error('Destination not found or access denied');
  }

  // Create the transport
  const { data: transport, error } = await supabase
    .from('transports')
    .insert({
      destination_id: data.destinationId,
      name: data.name,
      address: data.address,
      cost: data.cost,
      currency: data.currency,
      href: data.href || null,
      type: data.type,
      departure_at: data.departureAt ? data.departureAt.toISOString() : null,
      arrival_at: data.arrivalAt ? data.arrivalAt.toISOString() : null,
      duration: data.duration || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transport:', error);
    throw new Error('Failed to create transport');
  }

  revalidatePath(`/dashboard/trips/${destination.routes.trips.id}/${destination.routes.id}`);

  return {
    id: transport.id,
    destinationId: transport.destination_id,
    name: transport.name,
    address: transport.address,
    cost: transport.cost,
    currency: transport.currency,
    href: transport.href,
    type: transport.type,
    departureAt: transport.departure_at ? new Date(transport.departure_at) : undefined,
    arrivalAt: transport.arrival_at ? new Date(transport.arrival_at) : undefined,
    duration: transport.duration,
    createdAt: new Date(transport.created_at),
    updatedAt: new Date(transport.updated_at),
  };
}

export async function getTransportByDestinationId(destinationId: string): Promise<TransportData | null> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the destination belongs to a route in a trip owned by the user and get transport
  const { data: transports, error } = await supabase
    .from('transports')
    .select(`
      *,
      destinations!inner (
        id,
        routes!inner (
          id,
          trips!inner (
            id,
            user_id
          )
        )
      )
    `)
    .eq('destination_id', destinationId)
    .eq('destinations.routes.trips.user_id', user.id)
    .limit(1);

  if (error) {
    console.error('Error fetching transport:', error);
    throw new Error('Failed to fetch transport');
  }

  if (!transports || transports.length === 0) {
    return null;
  }

  const transport = transports[0];
  
  return {
    id: transport.id,
    destinationId: transport.destination_id,
    name: transport.name,
    address: transport.address,
    cost: transport.cost,
    currency: transport.currency,
    href: transport.href,
    type: transport.type,
    departureAt: transport.departure_at ? new Date(transport.departure_at) : undefined,
    arrivalAt: transport.arrival_at ? new Date(transport.arrival_at) : undefined,
    duration: transport.duration,
    createdAt: new Date(transport.created_at),
    updatedAt: new Date(transport.updated_at),
  };
}

export interface UpdateTransportData {
  transportId: string;
  name?: string;
  address?: string;
  cost?: number;
  currency?: string;
  href?: string;
  type?: 'airplane' | 'bus' | 'car' | 'train' | 'ferry' | 'other';
  departureAt?: Date;
  arrivalAt?: Date;
  duration?: number;
}

export async function updateTransport(data: UpdateTransportData): Promise<TransportData> {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify the transport belongs to a destination in a route in a trip owned by the user
  const { data: transport, error: transportError } = await supabase
    .from('transports')
    .select(`
      *,
      destinations!inner (
        id,
        routes!inner (
          id,
          trips!inner (
            id,
            user_id
          )
        )
      )
    `)
    .eq('id', data.transportId)
    .eq('destinations.routes.trips.user_id', user.id)
    .single();

  if (transportError || !transport) {
    throw new Error('Transport not found or access denied');
  }

  // Prepare update data
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.cost !== undefined) updateData.cost = data.cost;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.href !== undefined) updateData.href = data.href;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.departureAt !== undefined) updateData.departure_at = data.departureAt ? data.departureAt.toISOString() : null;
  if (data.arrivalAt !== undefined) updateData.arrival_at = data.arrivalAt ? data.arrivalAt.toISOString() : null;
  if (data.duration !== undefined) updateData.duration = data.duration;

  // Update the transport
  const { data: updatedTransport, error: updateError } = await supabase
    .from('transports')
    .update(updateData)
    .eq('id', data.transportId)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating transport:', updateError);
    throw new Error('Failed to update transport');
  }

  revalidatePath(`/dashboard/trips/${transport.destinations.routes.trips.id}/${transport.destinations.routes.id}`);

  return {
    id: updatedTransport.id,
    destinationId: updatedTransport.destination_id,
    name: updatedTransport.name,
    address: updatedTransport.address,
    cost: updatedTransport.cost,
    currency: updatedTransport.currency,
    href: updatedTransport.href,
    type: updatedTransport.type,
    departureAt: updatedTransport.departure_at ? new Date(updatedTransport.departure_at) : undefined,
    arrivalAt: updatedTransport.arrival_at ? new Date(updatedTransport.arrival_at) : undefined,
    duration: updatedTransport.duration,
    createdAt: new Date(updatedTransport.created_at),
    updatedAt: new Date(updatedTransport.updated_at),
  };
}
