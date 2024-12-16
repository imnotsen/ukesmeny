import PageLayout from "@/components/layout/page-layout";
import { fetchRecipes } from "./actions";
import WeeklyPlanner from "./weekly-client";

export default async function WeekPlannerPage() {
  const recipes = await fetchRecipes();

  return (
    <PageLayout>
      <WeeklyPlanner recipes={recipes} />
    </PageLayout>
  );
}
