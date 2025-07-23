/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    localeDetection: true, // Enable automatic locale detection based on browser/device settings
  },
  localePath: './public/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  // Disable locale routing in URLs - we want device-based detection only
  trailingSlash: false,
  // Configure namespace loading
  ns: ['common'],
  defaultNS: 'common',
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Disable suspense for SSR compatibility
  },
};

