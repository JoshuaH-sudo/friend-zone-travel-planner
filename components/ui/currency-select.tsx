import React from "react";

import { cn } from "@/lib/utils";

// data
import { currencies as AllCurrencies } from "country-data-list";

// shadcn
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

// radix-ui
import { Select as SelectPrimitive } from "@base-ui/react/select";

// types
export interface Currency {
  code: string;
  decimals: number;
  name: string;
  number: string;
  symbol?: string;
}

// constants
import { customCurrencies, allCurrencies } from "@/lib/constants/currencies";

interface CurrencySelectProps extends Omit<
  SelectPrimitive.Group.Props,
  "onValueChange"
> {
  value?: string;
  onValueChange?: (value: string) => void;
  onCurrencySelect?: (currency: Currency) => void;
  name: string;
  placeholder?: string;
  currencies?: "custom" | "all";
  variant?: "default" | "small";
  valid?: boolean;
}

const CurrencySelect = React.forwardRef<HTMLButtonElement, CurrencySelectProps>(
  (
    {
      value,
      onValueChange,
      onCurrencySelect,
      name,
      placeholder = "Select currency",
      currencies = "all",
      variant = "default",
      valid = true,
      ...props
    },
    ref,
  ) => {
    const { disabled } = props;
    const [selectedCurrency, setSelectedCurrency] =
      React.useState<Currency | null>(null);

    const uniqueCurrencies = React.useMemo<Currency[]>(() => {
      const currencyMap = new Map<string, Currency>();

      AllCurrencies.all.forEach((currency: Currency) => {
        if (currency.code && currency.name && currency.symbol) {
          let shouldInclude = false;

          switch (currencies) {
            case "custom":
              shouldInclude = customCurrencies.includes(currency.code);
              break;
            case "all":
              shouldInclude = !allCurrencies.includes(currency.code);
              break;
            default:
              shouldInclude = !allCurrencies.includes(currency.code);
          }

          if (shouldInclude) {
            // Special handling for Euro
            if (currency.code === "EUR") {
              currencyMap.set(currency.code, {
                code: currency.code,
                name: "Euro",
                symbol: currency.symbol,
                decimals: currency.decimals,
                number: currency.number,
              });
            } else {
              currencyMap.set(currency.code, {
                code: currency.code,
                name: currency.name,
                symbol: currency.symbol,
                decimals: currency.decimals,
                number: currency.number,
              });
            }
          }
        }
      });

      // Convert the map to an array and sort by currency name
      return Array.from(currencyMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }, [currencies]);

    const handleValueChange = (newValue: string) => {
      const fullCurrencyData = uniqueCurrencies.find(
        (curr) => curr.code === newValue,
      );
      if (fullCurrencyData) {
        setSelectedCurrency(fullCurrencyData);
        if (onValueChange) {
          onValueChange(newValue);
        }
        if (onCurrencySelect) {
          onCurrencySelect(fullCurrencyData);
        }
      }
    };

    void selectedCurrency;

    return (
      <>
        <div className="md:hidden">
          <NativeSelect
            className="w-full"
            size={variant === "small" ? "sm" : "default"}
            value={value ?? ""}
            onChange={(event) => handleValueChange(event.target.value)}
            name={name}
            disabled={disabled}
            aria-invalid={!valid}
            data-valid={valid}
            displayValue={value ? value : placeholder}
            displayValueClassName={
              value ? "text-foreground" : "text-muted-foreground"
            }
          >
            <NativeSelectOption value="" disabled>
              {placeholder}
            </NativeSelectOption>
            {uniqueCurrencies.map((currency) => (
              <NativeSelectOption key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="hidden md:block">
          <Select
            value={value}
            onValueChange={handleValueChange}
            {...props}
            name={name}
            data-valid={valid}
          >
            <SelectTrigger
              className={cn("w-full", variant === "small" && "w-fit gap-2")}
              data-valid={valid}
              ref={ref}
            >
              {value ? (
                <SelectValue placeholder={placeholder}>
                  <span>{value}</span>
                </SelectValue>
              ) : (
                <SelectValue placeholder={placeholder} />
              )}
            </SelectTrigger>
            <SelectContent className="w-max max-w-(--available-width) min-w-(--anchor-width)">
              <SelectGroup>
                {uniqueCurrencies.map((currency) => (
                  <SelectItem key={currency?.code} value={currency?.code || ""}>
                    <div className="flex w-full items-center gap-2">
                      <span className="text-muted-foreground w-8 text-left text-sm">
                        {currency?.code}
                      </span>
                      <span>{currency?.symbol}</span>
                      <span>{currency?.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </>
    );
  },
);

CurrencySelect.displayName = "CurrencySelect";

export { CurrencySelect };
