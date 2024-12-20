"use client";

import { Combobox } from "@/components/composite/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DayPlan, WeekPlannerEntry } from "@/types/types";
import { addDays, format, startOfWeek } from "date-fns";
import { nb } from "date-fns/locale";
import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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

  const currentWeekStart = useMemo(
    () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    []
  );

  useEffect(() => {
    const initialPlan: DayPlan = {};
    DAYS_OF_WEEK.forEach((_, index) => {
      const date = format(addDays(currentWeekStart, index), "yyyy-MM-dd");
      initialPlan[date] = [];
    });
    initialPlannedMeals.forEach((meal) => {
      if (meal.planned_date in initialPlan) {
        initialPlan[meal.planned_date].push(meal);
      }
    });
    setWeekPlan(initialPlan);
  }, [currentWeekStart, initialPlannedMeals]);

  const recipeItems = recipes.map((recipe) => ({
    value: recipe.id.toString(),
    label: recipe.name,
    searchValue: recipe.name,
  }));

  const handleAddRecipe = async (date: string, id: string) => {
    if (!id) return;

    const recipe = recipes.find((r) => r.id.toString() === id);
    if (!recipe) return;

    const tempId = Date.now();
    setWeekPlan((prev) => {
      const newPlan = { ...prev };
      newPlan[date] = [
        ...(prev[date] || []),
        {
          id: tempId,
          recipe_id: recipe.id,
          recipe: recipe,
          planned_date: date,
          servings: recipe.servings,
        } as WeekPlannerEntry,
      ];
      return newPlan;
    });

    try {
      const formData = new FormData();
      formData.append("recipe_id", id);
      formData.append("planned_date", date);
      formData.append("servings", recipe.servings.toString());

      const result = await addPlannedMeal(formData);

      if (result.error) {
        setWeekPlan((prev) => {
          const newPlan = { ...prev };
          newPlan[date] = prev[date].filter((entry) => entry.id !== tempId);
          return newPlan;
        });
        toast.error("Kunne ikke legge til oppskrift", {
          description: result.error,
        });
      } else if (result.data) {
        setWeekPlan((prev) => {
          const newPlan = { ...prev };
          newPlan[date] = prev[date].map((entry) =>
            entry.id === tempId ? (result.data as WeekPlannerEntry) : entry
          );
          return newPlan;
        });
      }
    } catch (error) {
      console.error(error);
      setWeekPlan((prev) => {
        const newPlan = { ...prev };
        newPlan[date] = prev[date].filter((entry) => entry.id !== tempId);
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

  const handleRemoveRecipe = async (date: string, entryId: number) => {
    try {
      console.log("Attempting to remove recipe with ID:", entryId);

      const result = await removePlannedMeal(entryId);
      console.log("Remove result:", result);

      if (result.error) {
        toast.error("Kunne ikke fjerne oppskrift", {
          description: result.error,
        });
        return;
      }

      setWeekPlan((prev) => {
        const newPlan = { ...prev };
        newPlan[date] = prev[date].filter((entry) => entry.id !== entryId);
        return newPlan;
      });
      toast.success("Oppskrift fjernet");
    } catch (error) {
      console.error("Error removing recipe:", error);

      console.error(error);
      toast.error("En feil oppstod");
    }
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS_OF_WEEK.map((day, index) => {
          const date = format(addDays(currentWeekStart, index), "yyyy-MM-dd");
          return (
            <Card key={day} className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {format(addDays(currentWeekStart, index), "EEEE d. MMM", {
                    locale: nb,
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Combobox
                  items={recipeItems}
                  placeholder="Søk etter oppskrift"
                  label="Oppskrift"
                  value={""}
                  onValueChange={(id) => handleAddRecipe(date, id)}
                />
                {weekPlan[date]?.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col bg-muted p-2 rounded-md gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {entry.recipe?.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRecipe(date, entry.id)}
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
                          onClick={() => handleUpdateServings(date, entry, -1)}
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
                          onClick={() => handleUpdateServings(date, entry, 1)}
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
          );
        })}
      </div>
    </div>
  );
}
