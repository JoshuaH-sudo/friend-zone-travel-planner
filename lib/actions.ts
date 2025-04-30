'use server';

import arcjet, { shield, detectBot, fixedWindow, request } from '@arcjet/next';
import { googleMapsClient } from './google-maps';

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
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        'CATEGORY:MONITOR', // Uptime monitoring services
        'CATEGORY:PREVIEW', // Link previews e.g. Slack, Discord
      ],
    }),
    fixedWindow({
      mode: 'LIVE',
      window: '1m',
      max: 20,
    }),
  ],
});

export const getAddressCoordinates = async (address: string) => {
  const decisionResponse = await decisionHandler();

  if (decisionResponse.error) {
    console.error(decisionResponse.error);
    return {
      status: 'ERROR',
      message: decisionResponse.error,
    };
  }

  const result = await googleMapsClient.geocode({
    params: {
      address,
      key: process.env.GOOGLE_MAPS_API_KEY!,
    },
  });

  if (result.data.status === 'ZERO_RESULTS') {
    return {
      status: 'ERROR',
      message: 'No results found',
    };
  }

  return {
    status: 'OK',
    results: result.data.results[0],
  };
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export const getTimezoneInformation = async (coordinates: Coordinates) => {
  const { lat, lng } = coordinates;
  const decisionResponse = await decisionHandler();

  if (decisionResponse.error) {
    console.error(decisionResponse.error);
    return {
      status: 'ERROR',
      message: decisionResponse.error,
    };
  }

  const result = await googleMapsClient.timezone({
    params: {
      location: `${lat},${lng}`,
      key: process.env.GOOGLE_MAPS_API_KEY!,
      timestamp: Math.floor(Date.now() / 1000),
    },
  });

  return {
    status: 'OK',
    results: result.data,
  };
};

export const getPlaceAutocomplete = async (input: string) => {
  const decisionResponse = await decisionHandler();

  if (decisionResponse.error) {
    console.error(decisionResponse.error);
    return {
      status: 'ERROR',
      message: decisionResponse.error,
    };
  }

  try {
    const result = await googleMapsClient.placeAutocomplete({
      params: {
        input,
        key: process.env.GOOGLE_MAPS_API_KEY!,
        // components: ['country:US'],
      },
    });

    return {
      status: 'OK',
      predictions: result.data.predictions,
    };
  } catch (error) {
    console.error('Error fetching place autocomplete:', error);
    return {
      status: 'ERROR',
      message: 'An error occurred while fetching place autocomplete.',
    };
  }
};

const decisionHandler = async () => {
  const req = await request();
  const decision = await aj.protect(req);
  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return {
        error: 'Too many attempts. Please try again later.',
      };
    }
    if (decision.reason.isBot()) {
      return {
        error: 'You are a bot. Please go away.',
      };
    }
    return {
      error: 'An error occurred.',
    };
  }
  return {
    error: null,
  };
};
