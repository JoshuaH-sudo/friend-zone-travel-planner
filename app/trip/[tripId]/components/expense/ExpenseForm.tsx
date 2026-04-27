"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useSettings } from "@/lib/SettingsProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Apple, MoreHorizontal, ShoppingBag, Ticket } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ExpenseFormValues = {
  name: string;
  description?: string;
  category: "food" | "activity" | "shopping" | "other";
  price: number;
  currency: string;
  date?: string;
};

type ExpenseFormProps = {
  initialValues: ExpenseFormValues;
  onSubmit: (data: ExpenseFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};

export function ExpenseForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
}: ExpenseFormProps) {
  const t = useTranslations("expense");
  const { defaultCurrency } = useSettings();

  const schema = z.object({
    name: z
      .string()
      .min(1, t("errors.nameRequired"))
      .max(200, t("errors.nameTooLong")),
    description: z
      .string()
      .min(0, t("errors.descriptionRequired"))
      .max(300, t("errors.descriptionTooLong"))
      .optional(),
    category: z.enum(["food", "activity", "shopping", "other"]),
    price: z
      .number()
      .min(0, t("errors.priceMustBePositive"))
      .max(Number.MAX_SAFE_INTEGER, t("errors.priceTooHigh")),
    currency: z.string(),
    date: z.string().optional(),
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const activityOptions = [
    {
      value: "food",
      label: t("category.food"),
      icon: <Apple className="text-primary h-4 w-4" />,
    },
    {
      value: "activity",
      label: t("category.activity"),
      icon: <Ticket className="text-primary h-4 w-4" />,
    },
    {
      value: "shopping",
      label: t("category.shopping"),
      icon: <ShoppingBag className="text-primary h-4 w-4" />,
    },
    {
      value: "other",
      label: t("category.other"),
      icon: <MoreHorizontal className="text-primary h-4 w-4" />,
    },
  ];

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit({
          ...data,
          price: Math.round(data.price * 100) / 100,
        });
      })}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input {...field} type="text" placeholder={t("namePlaceholder")} />
          )}
        />
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder={t("descriptionPlaceholder")}
              />
            )}
          />
          {errors.description && (
            <p className="text-destructive text-sm">
              {errors.description.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                {...field}
                items={activityOptions}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-45">
                  <SelectValue
                    placeholder={t("categoryPlaceholder")}
                    render={(props, item) => {
                      return (
                        <div className="flex items-center gap-2">
                          {
                            activityOptions.find(
                              (option) => option.value === item.value,
                            )?.icon
                          }
                          <span>
                            {
                              activityOptions.find(
                                (option) => option.value === item.value,
                              )?.label
                            }
                          </span>
                        </div>
                      );
                    }}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {activityOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.icon} {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <p className="text-destructive text-sm">
              {errors.category.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  type="date"
                  placeholder={t("datePlaceholder")}
                  className="peer"
                />
                {!field.value && (
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm peer-focus:hidden">
                    {t("datePlaceholder")}
                  </span>
                )}
              </div>
            )}
          />
          {errors.date && (
            <p className="text-destructive text-sm">{errors.date.message}</p>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <div className="space-y-2">
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <Input
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                type="number"
                step="0.01"
                placeholder={t("pricePlaceholder")}
              />
            )}
          />
          {errors.price && (
            <p className="text-destructive text-sm">{errors.price.message}</p>
          )}
        </div>
        <div className="w-24 space-y-2">
          <CurrencySelect
            name="currency"
            value={control._formValues.currency || defaultCurrency}
            onValueChange={(value) =>
              value && setValue("currency", value, { shouldValidate: true })
            }
          />
          {errors.currency && (
            <p className="text-destructive text-sm">
              {errors.currency.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit">{submitLabel ?? t("save")}</Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel ?? t("cancel")}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
