export const dynamic = "force-dynamic";

import PageLayout from "@/components/layout/page-layout";
import { fetchRecipes, getPlannedMeals } from "./actions";
import WeeklyPlanner from "./weekly-client";

export default async function WeekPlannerPage() {
  const recipes = await fetchRecipes();
  const { data: plannedMeals = [] } = await getPlannedMeals();

  return (
    <PageLayout>
      <WeeklyPlanner recipes={recipes} initialPlannedMeals={plannedMeals} />
    </PageLayout>
  );
}
