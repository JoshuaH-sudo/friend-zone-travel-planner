'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { updateRoute } from '../../actions/updateRoute';

export interface UpdateRouteNameProps {
  routeId: string;
  name: string;
  tripId?: string;
}

export type UpdateRouteNameResponse = {
  id: string;
  name: string;
  trip_id: string;
};

export type UseUpdateRouteNameOptions = UseMutationOptions<
  UpdateRouteNameResponse,
  Error,
  UpdateRouteNameProps
>;

const useUpdateRouteName = (props?: UseUpdateRouteNameOptions) =>
  useMutation({
    mutationFn: async ({ routeId, name, tripId }: UpdateRouteNameProps) => {
      // We need tripId for the updateRoute function, but we can get it from the route if needed
      if (!tripId) {
        throw new Error('tripId is required for updating route');
      }
      return await updateRoute({
        id: routeId,
        name,
        tripId
      });
    },
    ...props,
  });

export default useUpdateRouteName;

