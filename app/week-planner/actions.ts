'use server'

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