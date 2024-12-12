'use server'

import { CACHE_TAGS, CACHE_TIMES, createCacheKey } from '@/utils/cache-helpers';
import { normalizeString } from "@/utils/string-helpers";
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { Ingredient } from "./types";

const fetchIngredientsFromDB = async (supabase: SupabaseClient) => {
  try {
    const { data: ingredients, error } = await supabase
      .from("ingredients")
      .select("*")

    if (error) {
      console.error('Error fetching ingredients:', error)
      return []
    }

    return ingredients as Ingredient[]
  } catch (error) {
    console.error('Database fetch error:', error)
    return []
  }
}

const getCachedIngredients = unstable_cache(
  async (supabase: SupabaseClient) => fetchIngredientsFromDB(supabase),
  [createCacheKey('all-ingredients')],
  {
    revalidate: CACHE_TIMES.day,
    tags: [CACHE_TAGS.ingredients]
  }
)

export async function fetchIngredients(): Promise<Ingredient[]> {
  try {
    const supabase = createClient()
    return await getCachedIngredients(supabase)
  } catch (error) {
    console.error('Cache fetch error:', error)
    const supabase = createClient()
    return fetchIngredientsFromDB(supabase)
  }
}

export async function addIngredient(formData: FormData): Promise<{
  data?: Ingredient[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Authentication Error: No valid user');
      return { error: 'You must be logged in to add ingredients' };
    }

    const rawName = formData.get('name');
    const category = formData.get('category');

    if (!rawName || !category || typeof rawName !== 'string' || typeof category !== 'string') {
      console.error('Validation Error: Name or category missing or invalid');
      return { error: 'Name and category are required' };
    }

    const name = normalizeString(rawName);

    if (!name) {
      return { error: 'Ingredient name cannot be empty or just whitespace' };
    }

    const { data: existingIngredients } = await supabase
      .from('ingredients')
      .select('name')
      .ilike('name', name);

    if (existingIngredients && existingIngredients.length > 0) {
      return { 
        error: `Ingredient "${name}" already exists` 
      };
    }

    const { data, error } = await supabase
      .from('ingredients')
      .insert([{ 
        name,
        category,
        user_id: user.id
      }])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      if (error.code === '23505') {
        return { error: `Ingredient "${name}" already exists` };
      }
      return { error: error.message };
    }

    revalidatePath('/ingredients');
    revalidateTag(CACHE_TAGS.ingredients);
    
    return { data: data as Ingredient[] };
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}