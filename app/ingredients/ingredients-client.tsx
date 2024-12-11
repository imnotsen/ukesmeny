// ingredients-client.tsx
"use client";

import { Combobox } from "@/components/composite/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeString } from "@/utils/string-helpers";
import { useState } from "react";
import { toast } from "sonner";
import { addIngredient } from "./actions";
import { Category } from "./types";

export default function IngredientsPageClient({
  categories,
}: {
  categories: Category[];
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
    <div className="space-y-4">
      <Combobox
        items={categories}
        placeholder="Velg matvaretype"
        label="Matvaretype"
        value={selectedCategory}
        onValueChange={setSelectedCategory}
      />

      <div className="flex space-x-2">
        <Input
          placeholder="Legg til matvare"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          name="name"
          disabled={isSubmitting}
        />
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Legger til..." : "Legg til"}
        </Button>
      </div>
    </div>
  );
}
