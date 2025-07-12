'use client';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import updateRoute from '../../app/[locale]/(main-product)/auth/trips/[tripId]/actions/updateRoute';

export interface UpdateRouteNameProps {
  routeId: number;
  name: string;
}

export type UpdateRouteNameResponse = {
  id: number;
  name: string;
  tripId: number;
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
