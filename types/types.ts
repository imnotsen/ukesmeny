// types.ts

import { Ingredient } from "@/app/ingredients/types";
import { Recipe } from "@/app/recipes/types";

export type WeekPlannerEntry = {
  id: number;
  recipe_id: number;
  user_id: string;
  planned_date: string;
  servings: number;
  created_at: string;
  recipe?: Recipe;
};

export type ShoppingListItem = {
  id: number;
  user_id: string;
  ingredient_id: number;
  amount: number;
  measurement: string;
  is_checked: boolean;
  created_at: string;
  ingredient?: Ingredient;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type CalculatedShoppingItem = {
  ingredient_id: number;
  total_amount: number;
  measurement: string;
};