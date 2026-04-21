"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useSettings } from "@/lib/SettingsProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencySelect } from "@/components/ui/currency-select";

export type ExpenseFormValues = {
  name: string;
  description: string;
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
    name: z.string().min(1, t("errors.nameRequired")).max(200, t("errors.nameTooLong")),
    description: z.string().min(1, t("errors.descriptionRequired")).max(300, t("errors.descriptionTooLong")),
    category: z.enum(["food", "activity", "shopping", "other"]),
    price: z.number().min(0, t("errors.priceMustBePositive")).max(Number.MAX_SAFE_INTEGER, t("errors.priceTooHigh")),
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
            <Input
              {...field}
              type="text"
              placeholder={t("namePlaceholder")}
            />
          )}
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
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
        {errors.description && <p className="text-destructive text-sm">{errors.description.message}</p>}
      </div>
      <div className="space-y-2">
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <select {...field} className="w-full border rounded px-2 py-1">
              <option value="food">{t("category.food")}</option>
              <option value="activity">{t("category.activity")}</option>
              <option value="shopping">{t("category.shopping")}</option>
              <option value="other">{t("category.other")}</option>
            </select>
          )}
        />
        {errors.category && <p className="text-destructive text-sm">{errors.category.message}</p>}
      </div>
      <div className="flex gap-4">
        <div className="space-y-2">
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <Input
                {...field}
                onChange={e => field.onChange(parseFloat(e.target.value))}
                type="number"
                step="0.01"
                placeholder={t("pricePlaceholder")}
              />
            )}
          />
          {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
        </div>
        <div className="w-24 space-y-2">
          <CurrencySelect
            name="currency"
            value={control._formValues.currency || defaultCurrency}
            onValueChange={value => value && setValue("currency", value, { shouldValidate: true })}
          />
          {errors.currency && <p className="text-destructive text-sm">{errors.currency.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Input
              {...field}
              type="date"
              placeholder={t("datePlaceholder")}
            />
          )}
        />
        {errors.date && <p className="text-destructive text-sm">{errors.date.message}</p>}
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
