'use server'

import { normalizeString } from "@/utils/string-helpers";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Ingredient } from "./types";

export async function fetchIngredients(): Promise<Ingredient[]> {
  try {
    const supabase = createClient();
    const { data: ingredients, error } = await supabase
      .from("ingredients")
      .select("*");

    if (error) {
      console.error('Error fetching ingredients', error);
      return [];
    }

    return ingredients as Ingredient[] || [];
  } catch (error) {
    console.error('Unexpected Fetch Error:', error);
    return [];
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

    const { data: existingIngredient, error: searchError } = await supabase
      .from('ingredients')
      .select('name, category')
      .ilike('name', name)
      .single();

    if (searchError && searchError.code !== 'PGRST116') { 
      console.error('Supabase Search Error:', searchError);
      return { error: searchError.message };
    }

    if (existingIngredient) {
      return { 
        error: `Ingredient "${name}" already exists in category "${existingIngredient.category}"` 
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
    
    return { data: data as Ingredient[] };
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}