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

export type DayPlan = {
  [key: string]: WeekPlannerEntry[];
  };

export type DateRange = {
  startDate: string;
  endDate: string;
};

export interface ShoppingListItem {
  id: number;
  ingredient_id: number;
  amount: number;
  measurement: string;
  is_checked: boolean;
  ingredient: Ingredient;
}

export interface CalculatedShoppingItem {
  ingredient_id: number;
  ingredient_name: string;
  category: string;
  total_amount: number;
  measurement: string;
}