'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import updateRoute from '../../app/(main-product)/home/trips/[tripId]/actions/updateRoute';

export interface UpdateRouteNameProps {
  routeId: string;
  name: string;
}

export type UpdateRouteNameResponse = {
  id: string;
  name: string;
  tripId: string;
};

export type UseUpdateRouteNameOptions = UseMutationOptions<
  UpdateRouteNameResponse,
  Error,
  UpdateRouteNameProps
>;

const useUpdateRouteName = (props?: UseUpdateRouteNameOptions) =>
  useMutation({
    mutationFn: async ({ routeId, name }: UpdateRouteNameProps) => 
      await updateRoute(routeId, name),
    ...props,
  });

export default useUpdateRouteName;
