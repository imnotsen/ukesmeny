import { Recipe } from "../recipes/types";

export type DayPlan = {
    id: string;
    recipe: Recipe;
    servings: number;
  };
  
export type WeekPlan = {
    [key: string]: DayPlan[];
  };