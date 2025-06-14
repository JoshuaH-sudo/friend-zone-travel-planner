export type TripRouteParams = {
  locale: string;
  tripId: string;
}
export type TripPageProps = {
  params: Promise<TripRouteParams>;
}