// app/recipes/recipe-client.tsx
"use client";

import { Combobox } from "@/components/composite/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";
import { Ingredient } from "../ingredients/types";

type IngredientInput = {
  id: number;
  ingredientId: string | null;
  amount: string;
  measurement: string;
};

const MEASUREMENTS = [
  { value: "g", label: "Gram" },
  { value: "kg", label: "Kilogram" },
  { value: "ml", label: "Milliliter" },
  { value: "l", label: "Liter" },
  { value: "stk", label: "Stykk" },
  { value: "ss", label: "Spiseskje" },
  { value: "ts", label: "Teskje" },
];

export default function RecipePageClient({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const [recipeName, setRecipeName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredientInputs, setIngredientInputs] = useState<IngredientInput[]>([
    { id: 1, ingredientId: null, amount: "", measurement: "" },
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addIngredientInput = () => {
    const newId = Math.max(...ingredientInputs.map((i) => i.id)) + 1;
    setIngredientInputs([
      ...ingredientInputs,
      { id: newId, ingredientId: null, amount: "", measurement: "" },
    ]);
  };

  const removeIngredientInput = (id: number) => {
    if (ingredientInputs.length === 1) {
      return;
    }
    setIngredientInputs((inputs) => inputs.filter((input) => input.id !== id));
  };

  const handleIngredientChange = (
    id: number,
    field: keyof IngredientInput,
    value: string
  ) => {
    setIngredientInputs((inputs) =>
      inputs.map((input) =>
        input.id === id ? { ...input, [field]: value } : input
      )
    );
  };

  const ingredientOptions = ingredients.map((ing) => ({
    value: ing.id.toString(),
    label: ing.name,
  }));

  const measurementOptions = MEASUREMENTS.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  return (
    <div className="w-full max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Legg til oppskrift</h1>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="recipeName"
            className="block text-lg font-medium mb-1"
          >
            Navn på oppskrift
          </label>
          <Input
            id="recipeName"
            placeholder="Skriv inn navnet på oppskriften"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ingredienser</h2>
          {ingredientInputs.map((input) => (
            <div key={input.id} className="flex gap-4">
              <div className="grid grid-cols-3 gap-4 flex-1">
                <Combobox
                  items={ingredientOptions}
                  placeholder="Velg ingrediens"
                  label="Ingrediens"
                  value={input.ingredientId}
                  onValueChange={(value) =>
                    handleIngredientChange(input.id, "ingredientId", value)
                  }
                />
                <Input
                  placeholder="Mengde"
                  value={input.amount}
                  onChange={(e) =>
                    handleIngredientChange(input.id, "amount", e.target.value)
                  }
                  type="number"
                  min="0"
                />
                <Combobox
                  items={measurementOptions}
                  placeholder="Måleenhet"
                  label="Måleenhet"
                  value={input.measurement}
                  onValueChange={(value) =>
                    handleIngredientChange(input.id, "measurement", value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="self-center"
                onClick={() => removeIngredientInput(input.id)}
                disabled={ingredientInputs.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addIngredientInput}
            className="w-full"
          >
            Legg til flere ingredienser
          </Button>
        </div>

        <div>
          <label
            htmlFor="instructions"
            className="block text-lg font-medium mb-1"
          >
            Fremgangsmåte
          </label>
          <Textarea
            id="instructions"
            placeholder="Skriv inn fremgangsmåten"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Lagrer..." : "Lagre oppskrift"}
        </Button>
      </div>
    </div>
  );
}
