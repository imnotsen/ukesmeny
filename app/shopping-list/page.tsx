export const dynamic = "force-dynamic";

import PageLayout from "@/components/layout/page-layout";
import { getShoppingList } from "./actions";
import ShoppingListClient from "./shopping-list-client";

export default async function ShoppingListPage() {
  const { data: shoppingList = [], error: fetchError } =
    await getShoppingList();

  if (fetchError) {
    console.error("Error fetching shopping list:", fetchError);
  }

  return (
    <PageLayout>
      <ShoppingListClient initialItems={shoppingList} />
    </PageLayout>
  );
}
