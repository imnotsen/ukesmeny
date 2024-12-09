import { ComboboxDemo } from "@/components/composite/ingredient-combobox";
import { supabase } from "@/utils/supabase/supabase";

export default async function IngredientsPage() {
  const { data: food_items, error } = await supabase
    .from("food_items")
    .select("*");

  if (error) {
    console.error("Error fetching food items", error);
    return null;
  }

  const uniqueCategories = Array.from(
    new Set(food_items?.map((item) => item.category))
  ).map((category) => ({
    value: category,
    label: category,
  }));

  return (
    <>
      <ComboboxDemo foodItems={uniqueCategories ?? []} />
    </>
  );
}
