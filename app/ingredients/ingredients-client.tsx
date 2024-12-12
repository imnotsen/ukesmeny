"use client";

import { Combobox } from "@/components/composite/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { normalizeString } from "@/utils/string-helpers";
import { useState } from "react";
import { toast } from "sonner";
import { addIngredient } from "./actions";
import { Category, Ingredient } from "./types";

export default function IngredientsPageClient({
  categories,
  ingredients,
}: {
  categories: Category[];
  ingredients: Ingredient[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ingredientName, setIngredientName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const normalizedName = normalizeString(ingredientName);

    if (!normalizedName) {
      toast.error("Vennligst skriv inn et gyldig ingrediensnavn");
      return;
    }

    if (!selectedCategory) {
      toast.error("Vennligst velg en kategori");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", normalizedName);
    formData.append("category", selectedCategory);

    try {
      const result = await addIngredient(formData);

      if (result.error) {
        if (result.error.includes("already exists")) {
          toast.error(`${normalizedName} finnes allerede i databasen`, {
            description: "Prøv et annet navn",
            duration: 4000,
          });
        } else if (result.error.includes("logged in")) {
          toast.error("Du må være logget inn for å legge til ingredienser", {
            description: "Vennligst logg inn og prøv igjen",
            duration: 4000,
          });
        } else {
          toast.error("Noe gikk galt", {
            description: result.error,
            duration: 4000,
          });
        }
      } else {
        toast.success(`${normalizedName} ble lagt til!`, {
          description: `Lagt til i kategorien ${selectedCategory}`,
          duration: 3000,
        });
        setIngredientName("");
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error("Client submission error:", error);
      toast.error("En uventet feil oppstod", {
        description: "Vennligst prøv igjen senere",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      <div className="space-y-4 w-full md:w-64">
        <Combobox
          items={categories}
          placeholder="Velg matvaretype"
          label="Matvaretype"
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        />
        <Input
          placeholder="Legg til matvare"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          name="name"
          disabled={isSubmitting}
        />
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? "Legger til..." : "Legg til"}
        </Button>
      </div>
      <div className="flex-1 min-w-0">
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
                  Ingrediens
                </TableHead>
                <TableHead className="sticky top-0 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
                  Kategori
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.name}>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>{ingredient.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
