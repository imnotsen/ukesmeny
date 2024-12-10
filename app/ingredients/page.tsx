import { ComboboxDemo } from "@/components/composite/ingredient-combobox";
import PageLayout from "@/components/layout/page-layout";
import { supabase } from "@/utils/supabase/supabase";

export default async function IngredientsPage() {
  const { data: ingredients, error } = await supabase
    .from("ingredients")
    .select("*");

  if (error) {
    console.error("Error fetching food items", error);
    return null;
  }

  const uniqueCategories = Array.from(
    new Set(ingredients?.map((item) => item.category))
  ).map((category) => ({
    value: category,
    label: category,
  }));

  return (
    <PageLayout>
      <ComboboxDemo foodItems={uniqueCategories ?? []} />
    </PageLayout>
  );
}
