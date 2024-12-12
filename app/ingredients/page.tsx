export const dynamic = "force-dynamic";

import PageLayout from "@/components/layout/page-layout";
import { fetchIngredients } from "./actions";
import IngredientsPageClient from "./ingredients-client";

export default async function IngredientsPage() {
  const ingredients = await fetchIngredients();

  const uniqueCategories = Array.from(
    new Set(ingredients?.map((item) => item.category))
  ).map((category) => ({
    value: category,
    label: category,
  }));

  return (
    <PageLayout>
      <IngredientsPageClient
        categories={uniqueCategories}
        ingredients={ingredients}
      />
    </PageLayout>
  );
}
