"use client";
import { Combobox } from "@/components/composite/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DayPlan, WeekPlannerEntry } from "@/types/types";
import { getMeasurementLabel } from "@/utils/measurements";
import { Minus, Plus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Recipe } from "../recipes/types";
import {
  addPlannedMeal,
  removePlannedMeal,
  updatePlannedMeal,
} from "./actions";

const DAYS_OF_WEEK = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];

type WeeklyPlannerProps = {
  recipes: Recipe[];
  initialPlannedMeals: WeekPlannerEntry[];
};

export default function WeeklyPlanner({
  recipes,
  initialPlannedMeals,
}: WeeklyPlannerProps) {
  const [weekPlan, setWeekPlan] = useState<DayPlan>({});
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const initialPlan: DayPlan = {};
    DAYS_OF_WEEK.forEach((day) => {
      initialPlan[day] = [];
    });
    initialPlannedMeals.forEach((meal) => {
      if (meal.planned_date in initialPlan) {
        initialPlan[meal.planned_date].push(meal);
      }
    });
    setWeekPlan(initialPlan);
  }, [initialPlannedMeals]);

  const recipeItems = recipes.map((recipe) => ({
    value: recipe.id.toString(),
    label: recipe.name,
    searchValue: recipe.name,
  }));

  const handleAddRecipe = async (day: string, id: string) => {
    if (!id) return;

    const recipe = recipes.find((r) => r.id.toString() === id);
    if (!recipe) return;

    const tempId = Date.now();
    const initialServings = 2;

    setWeekPlan((prev) => {
      const newPlan = { ...prev };
      newPlan[day] = [
        ...(prev[day] || []),
        {
          id: tempId,
          recipe_id: recipe.id,
          recipe: recipe,
          planned_date: day,
          servings: initialServings,
        } as WeekPlannerEntry,
      ];
      return newPlan;
    });

    try {
      const formData = new FormData();
      formData.append("recipe_id", id);
      formData.append("planned_date", day);
      formData.append("servings", initialServings.toString());

      const result = await addPlannedMeal(formData);

      if (result.error) {
        setWeekPlan((prev) => {
          const newPlan = { ...prev };
          newPlan[day] = prev[day].filter((entry) => entry.id !== tempId);
          return newPlan;
        });
        toast.error("Kunne ikke legge til oppskrift", {
          description: result.error,
        });
      } else if (result.data) {
        setWeekPlan((prev) => {
          const newPlan = { ...prev };
          newPlan[day] = prev[day].map((entry) =>
            entry.id === tempId ? (result.data as WeekPlannerEntry) : entry
          );
          return newPlan;
        });
      }
    } catch (error) {
      console.error(error);
      setWeekPlan((prev) => {
        const newPlan = { ...prev };
        newPlan[day] = prev[day].filter((entry) => entry.id !== tempId);
        return newPlan;
      });
      toast.error("En feil oppstod");
    }
  };

  const handleUpdateServings = async (
    day: string,
    entry: WeekPlannerEntry,
    change: number
  ) => {
    const newServings = Math.max(1, entry.servings + change);

    setWeekPlan((prev) => {
      const newPlan = { ...prev };
      newPlan[day] = prev[day].map((e) =>
        e.id === entry.id ? { ...e, servings: newServings } : e
      );
      return newPlan;
    });

    try {
      const result = await updatePlannedMeal(entry.id, newServings);

      if (result.error) {
        setWeekPlan((prev) => {
          const newPlan = { ...prev };
          newPlan[day] = prev[day].map((e) =>
            e.id === entry.id ? { ...e, servings: entry.servings } : e
          );
          return newPlan;
        });
        toast.error("Kunne ikke oppdatere porsjoner", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error(error);
      setWeekPlan((prev) => {
        const newPlan = { ...prev };
        newPlan[day] = prev[day].map((e) =>
          e.id === entry.id ? { ...e, servings: entry.servings } : e
        );
        return newPlan;
      });
      toast.error("En feil oppstod");
    }
  };

  const handleRemoveRecipe = async (day: string, entryId: number) => {
    try {
      const result = await removePlannedMeal(entryId);

      if (result.error) {
        toast.error("Kunne ikke fjerne oppskrift", {
          description: result.error,
        });
        return;
      }

      setWeekPlan((prev) => {
        const newPlan = { ...prev };
        newPlan[day] = prev[day].filter((entry) => entry.id !== entryId);
        return newPlan;
      });
      toast.success("Oppskrift fjernet");
    } catch (error) {
      console.error(error);
      toast.error("En feil oppstod");
    }
  };

  return (
    <>
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAYS_OF_WEEK.map((day) => (
            <Card key={day} className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Combobox
                  items={recipeItems}
                  placeholder="Søk etter oppskrift"
                  label="Oppskrift"
                  value={""}
                  onValueChange={(id) => handleAddRecipe(day, id)}
                />
                {weekPlan[day]?.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col bg-muted p-2 rounded-md gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (entry.recipe) {
                            setSelectedRecipe(entry.recipe);
                          }
                        }}
                        className="text-sm font-medium hover:text-blue-600 text-left"
                      >
                        {entry.recipe?.name}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRecipe(day, entry.id)}
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
                          onClick={() => handleUpdateServings(day, entry, -1)}
                          className="h-6 w-6"
                          disabled={entry.servings <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-4 text-center">
                          {entry.servings}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateServings(day, entry, 1)}
                          className="h-6 w-6"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog
        open={!!selectedRecipe}
        onOpenChange={() => setSelectedRecipe(null)}
      >
        <DialogContent className="max-w-2xl bg-[#0C0D10] text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-normal">
              {selectedRecipe?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            {selectedRecipe && (
              <div className="p-4 space-y-8">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-5 h-5" />
                  <span className="text-lg">
                    {selectedRecipe.servings} porsjoner
                  </span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-normal">Ingredienser</h2>
                  <div className="space-y-2 text-gray-400">
                    {selectedRecipe.recipe_ingredients?.map(
                      (recipeIngredient) => (
                        <div key={recipeIngredient.id}>
                          {recipeIngredient.amount}{" "}
                          {getMeasurementLabel(recipeIngredient.measurement)}{" "}
                          {recipeIngredient.ingredient.name}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-normal">Fremgangsmåte</h2>
                  <div className="text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {selectedRecipe.instructions}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
