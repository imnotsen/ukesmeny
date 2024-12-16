'use server'

import { SupabaseClient } from '@supabase/supabase-js';
import { Recipe } from "../recipes/types";

const fetchRecipesFromDB = async (supabase: SupabaseClient) => {
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