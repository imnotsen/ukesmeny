export function createCacheKey(...parts: (string | number)[]) {
  return parts.join(':')
}

export const CACHE_TAGS = {
  ingredients: 'ingredients',
  recipes: 'recipes',
  shoppingList: 'shopping-list'
} as const

export const CACHE_TIMES = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400 // 24 hours
} as const