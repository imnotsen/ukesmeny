'use server'

import { CalculatedShoppingItem, ShoppingListItem } from '@/types/types';
import { createClient } from '@/utils/supabase/server';

export async function calculateShoppingList(dateRange: { startDate: string; endDate: string }): Promise<{
  data?: CalculatedShoppingItem[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Authentication required' };
    }

    const { data, error } = await supabase
      .rpc('calculate_shopping_list', {
        p_user_id: user.id,
        p_start_date: dateRange.startDate,
        p_end_date: dateRange.endDate
      });

    if (error) {
      console.error('Calculation Error:', error);
      return { error: error.message };
    }

    return { data: data as CalculatedShoppingItem[] };

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

    const { error: clearError } = await supabase
      .from('shopping_list')
      .delete()
      .eq('user_id', user.id);

    if (clearError) {
      console.error('Clear Error:', clearError);
      return { error: clearError.message };
    }

    const { error: insertError } = await supabase
      .from('shopping_list')
      .insert(
        items.map(item => ({
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