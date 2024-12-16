'use server'

import { normalizeString } from "@/utils/string-helpers";
import { createClient } from '@/utils/supabase/server';
import { Recipe } from './types';

type RecipeInput = {
  name: string;
  servings: number;
  instructions: string;
  ingredients: {
    ingredientId: number;
    amount: number;
    measurement: string;
  }[];
};

function parseFormData(formData: FormData): RecipeInput | { error: string } {
  const name = normalizeString(formData.get('name') as string);
  const servings = parseInt(formData.get('servings') as string);
  const instructions = formData.get('instructions') as string;
  
  const ingredientsData = formData.get('ingredients');
  let ingredients: RecipeInput['ingredients'] = [];
  
  try {
    ingredients = ingredientsData ? JSON.parse(ingredientsData as string) : [];
  } catch (error) {
    console.error('Invalid ingredients data format:', error);
    return { error: 'Invalid ingredients data format' };
  }

  if (!name) return { error: 'Recipe name is required' };
  if (!servings || servings <= 0) return { error: 'Valid number of servings is required' };
  if (!instructions) return { error: 'Instructions are required' };
  if (!ingredients.length) return { error: 'At least one ingredient is required' };

  return {
    name,
    servings,
    instructions,
    ingredients
  };
}

export async function addRecipe(formData: FormData): Promise<{
  data?: Recipe;
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('Authentication Error: No valid user');
      return { error: 'You must be logged in to add recipes' };
    }

    const parsedData = parseFormData(formData);
    if ('error' in parsedData) {
      return { error: parsedData.error };
    }

    const { data: existingRecipes } = await supabase
      .from('recipes')
      .select('name')
      .ilike('name', parsedData.name);

    if (existingRecipes && existingRecipes.length > 0) {
      return { error: `Recipe "${parsedData.name}" already exists` };
    }

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert([{
        name: parsedData.name,
        servings: parsedData.servings,
        instructions: parsedData.instructions,
        user_id: user.id,
      }])
      .select()
      .single();

    if (recipeError) {
      console.error('Recipe Insert Error:', recipeError);
      return { error: recipeError.message };
    }

    const ingredientsToInsert = parsedData.ingredients.map(ing => ({
      recipe_id: recipe.id,
      ingredient_id: ing.ingredientId,
      amount: ing.amount,
      measurement: ing.measurement,
    }));

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientsToInsert);

    if (ingredientsError) {
      console.error('Recipe Ingredients Insert Error:', ingredientsError);
      await supabase.from('recipes').delete().eq('id', recipe.id);
      return { error: 'Failed to add recipe ingredients' };
    }

    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          *,
          ingredient:ingredients (
            name,
            category
          )
        )
      `)
      .eq('id', recipe.id)
      .single();

    if (fetchError) {
      console.error('Recipe Fetch Error:', fetchError);
      return { error: 'Failed to fetch complete recipe' };
    }

    return { data: completeRecipe as Recipe };

  } catch (error) {
    console.error('Unexpected Error:', error);
    return { error: 'An unexpected error occurred' };
  }
}