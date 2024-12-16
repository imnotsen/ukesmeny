import { Ingredient } from "../ingredients/types";

export type Recipe = {
  id: number;
  name: string;
  servings: number;
  instructions: string;
  user_id: string;
  created_at: string;
  recipe_ingredients?: RecipeIngredient[];
};

export type RecipeIngredient = {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  amount: number;
  measurement: string;
  created_at: string;
  ingredient: Ingredient;
};