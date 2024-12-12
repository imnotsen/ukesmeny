// app/recipes/types.ts
import { Ingredient } from "../ingredients/types"

export type RecipeIngredient = {
  ingredient: Ingredient
  amount: number
  measurement: string
}

export type Recipe = {
  id: number
  title: string
  ingredients: RecipeIngredient[]
  instructions: string
  created_at?: string
  user_id: string
}