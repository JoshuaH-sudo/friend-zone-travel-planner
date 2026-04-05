import { currencies as countryDataCurrencies } from "country-data-list";

type CurrencyOption = {
  code: string;
  decimals: number;
  name: string;
  number: string;
  symbol?: string;
};

type RawCurrencyOption = CurrencyOption & {
  symbol?: string;
};

/**
 * New currencies data ISO-4217 from https://en.wikipedia.org/wiki/ISO_4217
 * Used in new <CurrencySelect /> component (Nov 2024)
 * adheres to package country-data-list
 */

// Currencies to exclude from the dropdown
export const allCurrencies = [
  "AXG", // Anguilla
  "BAM", // Bosnia and Herzegovina convertible mark
  "BMD", // Bermudian dollar
  "BOV", // Bolivian Mvdol (funds code)
  "CHE", // WIR Euro (complementary currency)
  "CHW", // WIR Franc (complementary currency)
  "CLF", // Chilean Unidad de Fomento (funds code)
  "COU", // Colombian Unidad de Valor Real (funds code)
  "CUC", // Cuban convertible peso
  "KID", // Kiribati dollar
  "KPW", // North Korean won
  "LAK", // Lao kip
  "MGA", // Malagasy ariary
  "MRO", // Mauritanian ouguiya (pre-2018)
  "MXV", // Mexican Unidad de Inversion (funds code)
  "OMR", // Omani rial
  "PRB", // Transnistrian ruble
  "SSP", // South Sudanese pound
  "STD", // São Tomé and Príncipe dobra (pre-2018)
  "SVC", // Salvadoran colón
  "TJS", // Tajikistani somoni
  "TMT", // Turkmenistan manat
  "TVD", // Tuvaluan dollar
  "USN", // United States dollar (next day) (funds code)
  "UYI", // Uruguay Peso en Unidades Indexadas (funds code)
  "VED", // Venezuelan bolívar digital
  "VES", // Venezuelan bolívar soberano
  "VND", // Vietnamese đồng
  "XAF", // Central African CFA franc
  "XAG", // Silver (troy ounce)
  "XAU", // Gold (troy ounce)
  "XBA", // European Composite Unit (EURCO) (bond market unit)
  "XBB", // European Monetary Unit (E.M.U.-6) (bond market unit)
  "XBC", // European Unit of Account 9 (E.U.A.-9) (bond market unit)
  "XBD", // European Unit of Account 17 (E.U.A.-17) (bond market unit)
  "XDR", // Special Drawing Rights
  "XOF", // West African CFA franc
  "XPD", // Palladium (troy ounce)
  "XPF", // CFP franc
  "XPT", // Platinum (troy ounce)
  "XSU", // Sucre (ALBA regional currency)
  "XTS", // Code reserved for testing purposes
  "XUA", // ADB Unit of Account
  "XUG", // Uganda shilling (pre-1987)
  "XXX", // No currency
  "ZWL", // Zimbabwean dollar (no longer in active use)
];

// Currencies to include in the dropdown
export const customCurrencies = [
  "DKK",
  "SEK",
  "NOK",
  "EUR",
  "USD",
  "CAD",
  "GBP",
  "AUD",
  "NZD",
] as const;

const customCurrencyCodeSet = new Set<string>(customCurrencies);

function isSupportedCurrency(currency: RawCurrencyOption): currency is CurrencyOption {
  return Boolean(currency.code && currency.name && currency.symbol);
}

function normalizeCurrencyOption(currency: CurrencyOption): CurrencyOption {
  if (currency.code === "EUR") {
    return {
      code: currency.code,
      name: "Euro",
      symbol: currency.symbol,
      decimals: currency.decimals,
      number: currency.number,
    };
  }

  return {
    code: currency.code,
    name: currency.name,
    symbol: currency.symbol,
    decimals: currency.decimals,
    number: currency.number,
  };
}

export const allCurrencyOptions = countryDataCurrencies.all
  .filter((currency): currency is RawCurrencyOption => isSupportedCurrency(currency))
  .filter((currency) => !allCurrencies.includes(currency.code))
  .map(normalizeCurrencyOption)
  .sort((left, right) => left.name.localeCompare(right.name));

export const customCurrencyOptions = allCurrencyOptions.filter((currency) =>
  customCurrencyCodeSet.has(currency.code),
);

export const allCurrencyCodes = allCurrencyOptions.map(
  (currency) => currency.code,
);

export const customCurrencyCodes = customCurrencyOptions.map(
  (currency) => currency.code,
);
