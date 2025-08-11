'use server';

import arcjet, { shield, detectBot, fixedWindow, request } from '@arcjet/next';
import { getJson } from 'serpapi';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({
      mode: 'LIVE',
    }),
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
        'CATEGORY:MONITOR', // Uptime monitoring services
        'CATEGORY:PREVIEW', // Link previews e.g. Slack, Discord
      ],
    }),
    fixedWindow({
      mode: 'LIVE',
      window: '1m',
      max: 10, // Lower limit for expensive API calls
    }),
  ],
});

// Types for Google Hotels API response
export interface HotelOption {
  name: string;
  price?: string;
  rating?: number;
  link?: string;
  thumbnail?: string;
  description?: string;
  amenities?: string[];
}

export interface AccommodationResponse {
  status: 'OK' | 'ERROR';
  message?: string;
  hotels?: HotelOption[];
}

// Types for Google Flights API response
export interface FlightOption {
  airline: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price?: string;
  link?: string;
  stops?: number;
  departure_airport: string;
  arrival_airport: string;
}

export interface FlightResponse {
  status: 'OK' | 'ERROR';
  message?: string;
  flights?: FlightOption[];
}

const decisionHandler = async () => {
  const req = await request();
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return {
        error: 'Too many requests. Please try again later.',
      };
    }
    if (decision.reason.isBot()) {
      return {
        error: 'Bot access denied.',
      };
    }
    return {
      error: 'Access denied.',
    };
  }
  return {
    error: null,
  };
};

export const getAccommodationPrices = async (
  location: string,
  checkInDate: string,
  checkOutDate: string
): Promise<AccommodationResponse> => {
  const decisionResponse = await decisionHandler();

  if (decisionResponse.error) {
    console.error('Arcjet decision error:', decisionResponse.error);
    return {
      status: 'ERROR',
      message: decisionResponse.error,
    };
  }

  try {
    const response = await getJson({
      engine: 'google_hotels',
      q: location,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      adults: 2, // Default to 2 adults
      currency: 'USD',
      gl: 'us',
      hl: 'en',
      api_key: process.env.SERPAPI_API_KEY,
    });

    if (response.error) {
      console.error('SerpAPI error:', response.error);
      return {
        status: 'ERROR',
        message: 'Failed to fetch accommodation data',
      };
    }

    const hotels: HotelOption[] = (response.properties || [])
      .slice(0, 5)
      .map((property: any) => ({
        name: property.name || 'Unknown Hotel',
        price: property.rate_per_night?.lowest || property.total_rate?.lowest,
        rating: property.overall_rating,
        link: property.link,
        thumbnail: property.images?.[0]?.thumbnail,
        description: property.description,
        amenities: property.amenities?.slice(0, 3) || [],
      }));

    return {
      status: 'OK',
      hotels,
    };
  } catch (error) {
    console.error('Error fetching accommodation prices:', error);
    return {
      status: 'ERROR',
      message: 'Failed to fetch accommodation data',
    };
  }
};

export const getFlightPrices = async (
  fromLocation: string,
  toLocation: string,
  departureDate: string,
  returnDate?: string
): Promise<FlightResponse> => {
  const decisionResponse = await decisionHandler();

  if (decisionResponse.error) {
    console.error('Arcjet decision error:', decisionResponse.error);
    return {
      status: 'ERROR',
      message: decisionResponse.error,
    };
  }

  try {
    const response = await getJson({
      engine: 'google_flights',
      departure_id: fromLocation,
      arrival_id: toLocation,
      outbound_date: departureDate,
      return_date: returnDate,
      currency: 'USD',
      hl: 'en',
      api_key: process.env.SERPAPI_API_KEY,
    });

    if (response.error) {
      console.error('SerpAPI error:', response.error);
      return {
        status: 'ERROR',
        message: 'Failed to fetch flight data',
      };
    }

    const flights: FlightOption[] = (response.best_flights || [])
      .slice(0, 5)
      .map((flight: any) => ({
        airline: flight.flights?.[0]?.airline || 'Unknown Airline',
        departure_time: flight.flights?.[0]?.departure_airport?.time || '',
        arrival_time: flight.flights?.[0]?.arrival_airport?.time || '',
        duration: flight.total_duration || '',
        price: flight.price?.toString(),
        link: flight.booking_link,
        stops: flight.flights?.length - 1 || 0,
        departure_airport:
          flight.flights?.[0]?.departure_airport?.id || fromLocation,
        arrival_airport: flight.flights?.[0]?.arrival_airport?.id || toLocation,
      }));

    return {
      status: 'OK',
      flights,
    };
  } catch (error) {
    console.error('Error fetching flight prices:', error);
    return {
      status: 'ERROR',
      message: 'Failed to fetch flight data',
    };
  }
};
