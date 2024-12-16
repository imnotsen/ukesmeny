"use client";

import { Combobox } from "@/components/composite/combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Ingredient } from "../ingredients/types";
import { addRecipe } from "./actions";

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
  { value: "cl", label: "Centiliter" },
  { value: "dl", label: "Desiliter" },
  { value: "l", label: "Liter" },
  { value: "stk", label: "Stykk" },
  { value: "fd", label: "Fedd" },
  { value: "ss", label: "Spiseskje" },
  { value: "ts", label: "Teskje" },
  { value: "hf", label: "Håndfull" },
  { value: "kl", label: "Klype" },
  { value: "dsj", label: "Dæsj" },
  { value: "skv", label: "Skvett" },
  { value: "tsk", label: "Til smak" },
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
  const [servings, setServings] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addIngredientInput = () => {
    const newId = Math.max(...ingredientInputs.map((i) => i.id)) + 1;
    setIngredientInputs([
      ...ingredientInputs,
      { id: newId, ingredientId: null, amount: "", measurement: "" },
    ]);
  };

  const removeIngredientInput = (id: number) => {
    if (ingredientInputs.length === 1) return;
    setIngredientInputs((inputs) => inputs.filter((input) => input.id !== id));
  };

  const handleIngredientChange = (
    id: number,
    field: keyof IngredientInput,
    value: string
  ) => {
    console.log("Ingredient change:", { id, field, value });
    setIngredientInputs((inputs) =>
      inputs.map((input) =>
        input.id === id ? { ...input, [field]: value } : input
      )
    );
  };

  const validateForm = () => {
    if (!recipeName.trim()) {
      toast.error("Vennligst skriv inn navnet på oppskriften");
      return false;
    }

    if (!instructions.trim()) {
      toast.error("Vennligst skriv inn fremgangsmåten");
      return false;
    }

    if (servings < 1) {
      toast.error("Antall porsjoner må være minst 1");
      return false;
    }

    const hasInvalidIngredients = ingredientInputs.some(
      (input) => !input.ingredientId || !input.amount || !input.measurement
    );

    if (hasInvalidIngredients) {
      toast.error(
        "Alle ingredienser må ha valgt ingrediens, mengde og måleenhet"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const ingredients = ingredientInputs.map((input) => ({
        ingredientId: parseInt(input.ingredientId!),
        amount: parseFloat(input.amount),
        measurement: input.measurement,
      }));

      const formData = new FormData();
      formData.append("name", recipeName);
      formData.append("servings", servings.toString());
      formData.append("instructions", instructions);
      formData.append("ingredients", JSON.stringify(ingredients));

      const result = await addRecipe(formData);

      if (result.error) {
        toast.error("Feil ved lagring av oppskrift", {
          description: result.error,
        });
      } else {
        toast.success("Oppskrift lagret!", {
          description: `${recipeName} er nå lagt til`,
        });
        setRecipeName("");
        setInstructions("");
        setServings(4);
        setIngredientInputs([
          { id: 1, ingredientId: null, amount: "", measurement: "" },
        ]);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("En uventet feil oppstod", {
        description: "Vennligst prøv igjen senere",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ingredientOptions = ingredients.map((ing) => ({
    value: ing.id.toString(),
    label: ing.name,
    // searchValue: ing.name,
  }));

  const measurementOptions = MEASUREMENTS.map((m) => ({
    value: m.value,
    label: m.label,
  }));

  return (
    <div className="w-full max-w-2xl space-y-6 px-4 sm:px-0">
      <h1 className="text-2xl font-bold">Legg til oppskrift</h1>

      <div className="space-y-6">
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

        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Ingredienser</h2>
          {ingredientInputs.map((input) => (
            <div
              key={input.id}
              className="space-y-4 sm:space-y-0 sm:flex sm:gap-4"
            >
              <div className="flex-1 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
                <div className="w-full">
                  <Combobox
                    items={ingredientOptions}
                    placeholder="Velg ingrediens"
                    label="Ingrediens"
                    value={input.ingredientId}
                    onValueChange={(value) =>
                      handleIngredientChange(input.id, "ingredientId", value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 flex-1">
                  <Input
                    placeholder="Mengde"
                    value={input.amount}
                    onChange={(e) =>
                      handleIngredientChange(input.id, "amount", e.target.value)
                    }
                    type="number"
                    min="0"
                    className="w-full"
                  />
                  <Combobox
                    items={measurementOptions}
                    placeholder="Måleenhet"
                    label="Måleenhet"
                    value={input.measurement}
                    onValueChange={(value) =>
                      handleIngredientChange(input.id, "measurement", value)
                    }
                    className="w-full"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-full sm:w-auto hidden sm:inline-block"
                onClick={() => removeIngredientInput(input.id)}
                disabled={ingredientInputs.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="sm:hidden w-full"
                onClick={() => removeIngredientInput(input.id)}
                disabled={ingredientInputs.length === 1}
              >
                Fjern ingrediens
              </Button>
              <hr />
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

        <div className="space-y-2">
          <label htmlFor="servings" className="block text-lg font-medium mb-1">
            Porsjoner
          </label>
          <Input
            id="servings"
            placeholder="Antall porsjoner"
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value))}
            type="number"
            min="1"
            className="w-full"
          />
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

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Lagrer..." : "Lagre oppskrift"}
        </Button>
      </div>
    </div>
  );
}
