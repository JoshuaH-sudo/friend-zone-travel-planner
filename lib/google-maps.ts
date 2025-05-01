import { Client } from '@googlemaps/google-maps-services-js';

// Imports the Places library
const {PlacesClient} = require('@googlemaps/places').v1;

// Instantiates a client
export const placesClient = new PlacesClient({
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
});


export const googleMapsClient = new Client({});