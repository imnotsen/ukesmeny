"use client";

import { Combobox } from "@/components/composite/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { Recipe } from "../recipes/types";

type DayPlan = {
  id: string;
  recipe: Recipe;
  servings: number;
};

type WeekPlan = {
  [key: string]: DayPlan[];
};

const DAYS_OF_WEEK = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];

export default function WeeklyPlanner({ recipes }: { recipes: Recipe[] }) {
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [weekPlan, setWeekPlan] = useState<WeekPlan>({
    Mandag: [],
    Tirsdag: [],
    Onsdag: [],
    Torsdag: [],
    Fredag: [],
    Lørdag: [],
    Søndag: [],
  });

  const recipeItems = recipes.map((recipe) => ({
    value: recipe.id.toString(),
    label: recipe.name,
  }));

  const handleAddRecipe = (day: string) => {
    const recipe = recipes.find((r) => r.id.toString() === selectedRecipe);
    if (!recipe || !selectedRecipe) return;

    setWeekPlan((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          id: `${day}-${Date.now()}`,
          recipe,
          servings: recipe.servings || 4,
        },
      ],
    }));
    setSelectedRecipe(null);
  };

  const handleRemoveRecipe = (day: string, id: string) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: prev[day].filter((plan) => plan.id !== id),
    }));
  };

  const handleUpdateServings = (day: string, id: string, change: number) => {
    setWeekPlan((prev) => ({
      ...prev,
      [day]: prev[day].map((plan) => {
        if (plan.id === id) {
          const newServings = Math.max(1, plan.servings + change);
          return { ...plan, servings: newServings };
        }
        return plan;
      }),
    }));
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-8 flex gap-4">
        <div className="w-64">
          <Combobox
            items={recipeItems}
            placeholder="Velg en oppskrift"
            label="Oppskrift"
            value={selectedRecipe}
            onValueChange={setSelectedRecipe}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map((day) => (
          <Card key={day} className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {weekPlan[day].map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col bg-muted p-2 rounded-md gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {plan.recipe.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRecipe(day, plan.id)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Porsjoner:
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateServings(day, plan.id, -1)}
                        className="h-6 w-6"
                        disabled={plan.servings <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-4 text-center">
                        {plan.servings}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateServings(day, plan.id, 1)}
                        className="h-6 w-6"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={!selectedRecipe}
                onClick={() => handleAddRecipe(day)}
              >
                Legg til oppskrift
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
