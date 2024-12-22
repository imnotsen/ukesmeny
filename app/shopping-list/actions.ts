'use server'

import { CalculatedShoppingItem, ShoppingListItem, WeekPlannerEntry } from '@/types/types';
import { convertFromBaseUnit, getBaseUnit, normalizeToBaseUnit, shouldNormalize } from '@/utils/measurement-convertion';
import { createClient } from '@/utils/supabase/server';

export async function calculateShoppingList(): Promise<{
  data?: CalculatedShoppingItem[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Authentication required' };
    }

    const { data: weekPlannerEntries, error: mealsError } = await supabase
      .from('week_planner')
      .select(`
        *,
        recipe:recipes (
          *,
          recipe_ingredients (
            amount,
            measurement,
            ingredient:ingredients (*)
          )
        )
      `)
      .eq('user_id', user.id);

    if (mealsError) {
      console.error('Error fetching planned meals:', mealsError);
      return { error: mealsError.message };
    }

    const ingredientTotals = new Map<string, CalculatedShoppingItem>();

    (weekPlannerEntries as WeekPlannerEntry[])?.forEach((entry) => {
      const servingsRatio = entry.servings / entry.recipe!.servings;

      entry.recipe!.recipe_ingredients?.forEach((ri) => {
        const adjustedAmount = ri.amount * servingsRatio;
        const ingredientId = ri.ingredient.id;
        const baseUnit = getBaseUnit(ri.measurement);
        const key = `${ingredientId}-${baseUnit}`;

        let normalizedAmount = adjustedAmount;
        let finalUnit = ri.measurement;

        if (shouldNormalize(ri.measurement)) {
          const normalized = normalizeToBaseUnit(adjustedAmount, ri.measurement);
          normalizedAmount = normalized.value;
          finalUnit = normalized.unit;
        }

        if (ingredientTotals.has(key)) {
          const existing = ingredientTotals.get(key)!;
          existing.total_amount += normalizedAmount;
        } else {
          ingredientTotals.set(key, {
            ingredient_id: ingredientId,
            ingredient_name: ri.ingredient.name,
            category: ri.ingredient.category,
            total_amount: normalizedAmount,
            measurement: finalUnit
          });
        }
      });
    });

    const calculatedItems = Array.from(ingredientTotals.values()).map(item => {
      let formattedAmount = item.total_amount;
      let formattedUnit = item.measurement;

      if (shouldNormalize(formattedUnit)) {
        const converted = convertFromBaseUnit(formattedAmount, formattedUnit);
        formattedAmount = converted.value;
        formattedUnit = converted.unit;
      }

      return {
        ...item,
        total_amount: formattedAmount,
        measurement: formattedUnit
      };
    });

    return { data: calculatedItems };

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateShoppingList(items: CalculatedShoppingItem[]): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Authentication required' };
    }

    const { data: existingItems, error: fetchError } = await supabase
      .from('shopping_list')
      .select('ingredient_id')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Fetch Error:', fetchError);
      return { error: fetchError.message };
    }

    const existingIngredientIds = new Set(existingItems?.map(item => item.ingredient_id));

    const itemsToInsert = items.filter(item => !existingIngredientIds.has(item.ingredient_id));
    const itemsToUpdate = items.filter(item => existingIngredientIds.has(item.ingredient_id));

    for (const item of itemsToUpdate) {
      const { error: updateError } = await supabase
        .from('shopping_list')
        .update({
          amount: item.total_amount,
          measurement: item.measurement
        })
        .eq('user_id', user.id)
        .eq('ingredient_id', item.ingredient_id);

      if (updateError) {
        console.error('Update Error:', updateError);
        return { error: updateError.message };
      }
    }

    if (itemsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('shopping_list')
        .insert(
          itemsToInsert.map(item => ({
            user_id: user.id,
            ingredient_id: item.ingredient_id,
            amount: item.total_amount,
            measurement: item.measurement,
            is_checked: false
          }))
        );

      if (insertError) {
        console.error('Insert Error:', insertError);
        return { error: insertError.message };
      }
    }

    const currentIngredientIds = new Set(items.map(item => item.ingredient_id));
    const itemsToRemove = Array.from(existingIngredientIds)
      .filter(id => !currentIngredientIds.has(id));

    if (itemsToRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('shopping_list')
        .delete()
        .eq('user_id', user.id)
        .in('ingredient_id', itemsToRemove);

      if (deleteError) {
        console.error('Delete Error:', deleteError);
        return { error: deleteError.message };
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function toggleShoppingItem(itemId: number, isChecked: boolean): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Authentication required' };
    }

    const { error } = await supabase
      .from('shopping_list')
      .update({ is_checked: isChecked })
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Update Error:', error);
      return { error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getShoppingList(): Promise<{
  data?: ShoppingListItem[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Authentication required' };
    }

    const { data, error } = await supabase
      .from('shopping_list')
      .select(`
        *,
        ingredient:ingredients (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch Error:', error);
      return { error: error.message };
    }

    return { data: data as ShoppingListItem[] };

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function addCustomShoppingItem(formData: FormData): Promise<{
  data?: ShoppingListItem;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Authentication required' };
    }

    const name = formData.get('name') as string;
    const amount = formData.get('amount') as string;

    if (!name || !amount) {
      return { error: 'Name and amount are required' };
    }

    const { data: ingredient, error: ingredientError } = await supabase
      .from('ingredients')
      .insert([
        { 
          name,
          category: 'Custom',
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (ingredientError) {
      console.error('Error creating ingredient:', ingredientError);
      return { error: ingredientError.message };
    }

    const { data: shoppingItem, error: shoppingError } = await supabase
      .from('shopping_list')
      .insert([
        {
          user_id: user.id,
          ingredient_id: ingredient.id,
          amount: 1,
          measurement: amount, 
          is_checked: false
        }
      ])
      .select(`
        *,
        ingredient:ingredients (*)
      `)
      .single();

    if (shoppingError) {
      console.error('Error adding to shopping list:', shoppingError);
      return { error: shoppingError.message };
    }

    return { data: shoppingItem as ShoppingListItem };

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function clearShoppingList(): Promise<{
  success?: boolean;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Authentication required' };
    }

    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing shopping list:', error);
      return { error: error.message };
    }

    return { success: true };

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}