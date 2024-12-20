'use server'

import { WeekPlannerEntry } from '@/types/types';
import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Recipe } from "../recipes/types";


export const fetchRecipesFromDB = async (supabase: SupabaseClient) => {
    try {
        const { data: recipes, error } = await supabase
            .from('recipes')
            .select('*')

            if (error) {
                console.error('Error fetching recipes:', error)
                return []
            }

            return recipes as Recipe[]
    } catch (error) {
        console.error('Database fetch error:', error)
        return []
    }
}

export async function fetchRecipes(): Promise<Recipe[]> {
    try {
        const supabase = createClient()
        return await fetchRecipesFromDB(supabase)
    } catch (error) {
        console.error('Cache fetch error:', error)
        const supabase = createClient()
        return fetchRecipesFromDB(supabase)
    }
}

export async function addPlannedMeal(formData: FormData): Promise<{
    data?: WeekPlannerEntry;
    error?: string;
  }> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        return { error: 'You must be logged in to add planned meals' };
      }
  
      const recipe_id = parseInt(formData.get('recipe_id') as string);
      const planned_date = formData.get('planned_date') as string;
      const servings = parseInt(formData.get('servings') as string);
  
      if (!recipe_id || !planned_date || !servings) {
        return { error: 'Missing required fields' };
      }
  
      if (servings <= 0) {
        return { error: 'Servings must be greater than 0' };
      }
  
      const { data, error } = await supabase
        .from('week_planner')
        .insert([
          {
            recipe_id,
            planned_date,
            servings,
            user_id: user.id
          }
        ])
        .select(`
          *,
          recipe:recipes (
            *,
            recipe_ingredients (
              *,
              ingredient:ingredients (*)
            )
          )
        `)
        .single();
  
      if (error) {
        console.error('Planner Insert Error:', error);
        return { error: error.message };
      }
  
      return { data: data as WeekPlannerEntry };
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  export async function getPlannedMeals(dateRange: { startDate: string; endDate: string }): Promise<{
    data?: WeekPlannerEntry[];
    error?: string;
  }> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        return { error: 'Authentication required' };
      }
  
      const { data, error } = await supabase
        .from('week_planner')
        .select(`
          *,
          recipe:recipes (
            *,
            recipe_ingredients (
              *,
              ingredient:ingredients (*)
            )
          )
        `)
        .gte('planned_date', dateRange.startDate)
        .lte('planned_date', dateRange.endDate)
        .order('planned_date', { ascending: true });
  
      if (error) {
        console.error('Fetch Error:', error);
        return { error: error.message };
      }
  
      return { data: data as WeekPlannerEntry[] };
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }
  
  export async function removePlannedMeal(id: number): Promise<{
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
        .from('week_planner')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
  
      if (error) {
        console.error('Delete Error:', error);
        return { error: error.message };
      }
  
      return { success: true };
  
    } catch (error) {
      console.error('Unexpected Error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }