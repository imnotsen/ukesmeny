import PageLayout from "@/components/layout/page-layout";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { fetchRecipes, getPlannedMeals } from "./actions";
import WeeklyPlanner from "./weekly-client";

export default async function WeekPlannerPage() {
  const currentDate = new Date();
  const startDate = format(
    startOfWeek(currentDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );
  const endDate = format(
    endOfWeek(currentDate, { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );

  const [recipesResult, plannedMealsResult] = await Promise.all([
    fetchRecipes(),
    getPlannedMeals({ startDate, endDate }),
  ]);

  return (
    <PageLayout>
      <WeeklyPlanner
        recipes={recipesResult}
        initialPlannedMeals={plannedMealsResult.data || []}
      />
    </PageLayout>
  );
}
