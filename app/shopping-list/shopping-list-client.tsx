"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ShoppingListItem } from "@/types/types";
import { formatMeasurement } from "@/utils/measurement-convertion";
import { getMeasurementLabel } from "@/utils/measurements";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  addCustomShoppingItem,
  clearShoppingList,
  toggleShoppingItem,
} from "./actions";

type ShoppingListClientProps = {
  initialItems: ShoppingListItem[];
};

export default function ShoppingListClient({
  initialItems,
}: ShoppingListClientProps) {
  const [items, setItems] = useState<ShoppingListItem[]>(initialItems);
  const [pendingItems, setPendingItems] = useState<Set<number>>(new Set());
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const handleToggle = useCallback(async (itemId: number, checked: boolean) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, is_checked: checked } : item
      )
    );

    setPendingItems((prev) => new Set(prev).add(itemId));

    try {
      const result = await toggleShoppingItem(itemId, checked);

      if (result.error) {
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, is_checked: !checked } : item
          )
        );
        toast.error("Kunne ikke oppdatere status", {
          description: result.error,
        });
      }
    } catch (error) {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, is_checked: !checked } : item
        )
      );
      console.error(error);
      toast.error("En feil oppstod");
    } finally {
      setPendingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }, []);

  const groupedItems = items.reduce((acc, item) => {
    const category = item.ingredient.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingItem(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await addCustomShoppingItem(formData);

      if (result.error) {
        toast.error("Kunne ikke legge til vare", {
          description: result.error,
        });
      } else if (result.data) {
        setItems((currentItems) => {
          return [...currentItems, result.data!];
        });
        toast.success("Vare lagt til");
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error(error);
      toast.error("En feil oppstod");
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleClearList = async () => {
    try {
      const result = await clearShoppingList();

      if (result.error) {
        toast.error("Kunne ikke tømme handlelisten", {
          description: result.error,
        });
      } else {
        setItems([]);
        setIsConfirmingClear(false);
        toast.success("Handlelisten er tømt");
      }
    } catch (error) {
      console.error(error);
      toast.error("En feil oppstod");
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="space-y-2">
            <h3 className="font-semibold">{category}</h3>
            <div className="space-y-1">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-2 rounded-lg hover:bg-accent"
                >
                  <Checkbox
                    checked={item.is_checked}
                    disabled={pendingItems.has(item.id)}
                    onCheckedChange={(checked) =>
                      handleToggle(item.id, checked as boolean)
                    }
                    className={pendingItems.has(item.id) ? "opacity-50" : ""}
                  />
                  <span
                    className={`flex-1 ${
                      item.is_checked
                        ? "line-through text-muted-foreground"
                        : ""
                    } ${pendingItems.has(item.id) ? "opacity-50" : ""}`}
                  >
                    {item.ingredient.name}
                  </span>
                  <span
                    className={`text-sm ${
                      item.is_checked ? "text-muted-foreground" : ""
                    } ${pendingItems.has(item.id) ? "opacity-50" : ""}`}
                  >
                    {formatMeasurement(
                      item.amount,
                      getMeasurementLabel(item.measurement)
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddItem} className="flex gap-2 items-end">
        <div className="flex-1 space-y-2">
          <Input
            name="name"
            placeholder="Varenavn"
            required
            disabled={isAddingItem}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Input
            name="amount"
            placeholder="Mengde (f.eks. '2 stk' eller '1 pose')"
            required
            disabled={isAddingItem}
          />
        </div>
        <Button type="submit" disabled={isAddingItem}>
          {isAddingItem ? "Legger til..." : "Legg til"}
        </Button>
      </form>
      <Dialog open={isConfirmingClear} onOpenChange={setIsConfirmingClear}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            Ferdig handlet
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tøm handleliste</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil tømme handlelisten? Dette kan ikke
              angres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmingClear(false)}
            >
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleClearList}>
              Tøm liste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
