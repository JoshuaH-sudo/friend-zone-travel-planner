"use client";
import { useState } from "react";
import { ExpenseDocumentType } from "@/lib/rxdb-schema";
import { useDatabase } from "@/lib/DatabaseProvider";
import { generateId } from "@/lib/rxdb-database";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpenseForm, ExpenseFormValues } from "./ExpenseForm";
import {
  Utensils,
  ShoppingBag,
  Ticket,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

export function Expenses({
  stopId,
  tripId,
  expenses,
  defaultCurrency,
}: {
  stopId: string;
  tripId: string;
  expenses: ExpenseDocumentType[];
  defaultCurrency: string;
}) {
  const db = useDatabase();
  const t = useTranslations("expense");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = async (data: ExpenseFormValues) => {
    await db.expenses.insert({
      id: generateId(),
      tripId,
      stopId,
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      currency: data.currency,
      date: data.date || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setIsAdding(false);
  };

  const handleEdit = async (id: string, data: ExpenseFormValues) => {
    const doc = expenses.find((e) => e.id === id);
    if (!doc) return;
    await doc.patch({
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      currency: data.currency,
      date: data.date || undefined,
      updatedAt: Date.now(),
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const doc = expenses.find((e) => e.id === id);
    if (!doc) return;
    await doc.remove();
  };

  return (
    <div className="flex flex-col gap-3">
      {isAdding && (
        <Card>
          <CardContent className="p-4">
            <ExpenseForm
              initialValues={{
                name: "",
                description: "",
                category: "other",
                price: 0,
                currency: defaultCurrency,
                date: "",
              }}
              onSubmit={handleAdd}
              onCancel={() => setIsAdding(false)}
              submitLabel={t("save")}
              cancelLabel={t("cancel")}
            />
          </CardContent>
        </Card>
      )}
      {expenses.map((expense) => (
        <Card key={expense.id} className="py-2 border-border/50 rounded-md ring-foreground/5">
          <CardContent className="flex items-center justify-between px-3 py-2">
            {editingId === expense.id ? (
              <ExpenseForm
                initialValues={{
                  name: expense.name,
                  description: expense.description,
                  category: expense.category,
                  price: expense.price,
                  currency: expense.currency,
                  date: expense.date,
                }}
                onSubmit={(data) => handleEdit(expense.id, data)}
                onCancel={() => setEditingId(null)}
                submitLabel={t("save")}
                cancelLabel={t("cancel")}
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {expense.category === "food" && (
                    <Utensils className="text-primary h-4 w-4" />
                  )}
                  {expense.category === "activity" && (
                    <Ticket className="text-primary h-4 w-4" />
                  )}
                  {expense.category === "shopping" && (
                    <ShoppingBag className="text-primary h-4 w-4" />
                  )}
                  {expense.category === "other" && (
                    <MoreHorizontal className="text-primary h-4 w-4" />
                  )}
                  <div>
                    <div className="font-medium">{expense.name}</div>
                    {expense.description && (
                      <div className="text-muted-foreground text-xs">
                        {expense.description}
                      </div>
                    )}
                    {expense.date && (
                      <div className="text-muted-foreground text-xs">
                        {expense.date}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm font-medium">
                    {formatMoney(expense.price, expense.currency)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(expense.id)}
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(expense.id)}
                    className="text-muted-foreground hover:text-destructive h-7 w-7"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="text-muted-foreground w-fit px-0"
        >
          <Plus className="h-4 w-4" />
          {t("actions.addExpense")}
        </Button>
      </div>
    </div>
  );
}
