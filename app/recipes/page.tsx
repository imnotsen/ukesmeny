export const dynamic = "force-dynamic";

import PageLayout from "@/components/layout/page-layout";
import { fetchIngredients } from "../ingredients/actions";
import RecipePageClient from "./recipe-client";

export default async function RecipePage() {
  const ingredients = await fetchIngredients();

  return (
    <PageLayout>
      <RecipePageClient ingredients={ingredients} />
    </PageLayout>
  );
}
