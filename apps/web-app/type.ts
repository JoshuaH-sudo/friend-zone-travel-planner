
export type Friend = {
  id: number;
  name: string;
  // location: string;
  // lat: number;
  // lng: number;
  // available: {
  //   weekday: [number, number]; // [start, end] in hours
  //   weekend: [number, number]; // [start, end] in hours
  //   [day: string]: [number, number]; // [start, end] in hours for specific dates
  // };
};

export type Destinations = {
  location: string;
  timezone: string;
  utc: string;
  lat: number;
  lng: number;
  startDate: Date;
  endDate: Date;
  friends: Friend[];
};

export type Route = {
  id: number;
  name: string;
  startLocation: string;
  endLocation: string;
}

export type Trip = {
  name: string;
  routes: Route[];
}