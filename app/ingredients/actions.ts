'use server'

import { normalizeString } from "@/utils/string-helpers";
import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { Ingredient } from "./types";

export async function addIngredient(formData: FormData): Promise<{
  data?: Ingredient[];
  error?: string;
}> {
  try {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options)
          }
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Authentication Error: No valid user');
      return { error: 'You must be logged in to add ingredients' };
    }

    // Rest of your function remains the same
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
    return { data: data as Ingredient[] };
  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function fetchIngredients(): Promise<Ingredient[]> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options)
          }
        }
      }
    );

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