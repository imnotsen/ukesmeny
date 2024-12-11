/* eslint-disable @typescript-eslint/no-explicit-any */
import PageLayout from "@/components/layout/page-layout";
import { fetchIngredients } from "./actions";
import IngredientsPageClient from "./ingredients-client";

export default async function IngredientsPage() {
  console.log("Server Page - Fetching Ingredients");

  const ingredients = await fetchIngredients();
  console.log("Server Page - Fetched Ingredients:", ingredients);

  const uniqueCategories = Array.from(
    new Set(ingredients?.map((item: any) => item.category))
  ).map((category) => ({
    value: category,
    label: category,
  }));

  console.log("Server Page - Unique Categories:", uniqueCategories);

  return (
    <PageLayout>
      <IngredientsPageClient
        categories={uniqueCategories}
        ingredients={ingredients}
      />
    </PageLayout>
  );
}
