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
        <Card key={expense.id}>
          <CardContent className="flex items-center justify-between p-4">
            {editingId === expense.id ? (
              <ExpenseForm
                initialValues={{
                  name: expense.name,
                  description: expense.description,
                  category: expense.category,
                  price: expense.price,
                  currency: expense.currency,
                  date: expense.date || "",
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
                    <div className="text-muted-foreground text-xs">
                      {expense.description}
                    </div>
                    {expense.date && (
                      <div className="text-muted-foreground text-xs">
                        {expense.date}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {formatMoney(expense.price, expense.currency)}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingId(expense.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(expense.id)}
                  >
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
