export type Ingredient = {
    id: number;
    name: string;
    category: string;
    created_at?: string;
  }
  
  export type Category = {
    value: string;
    label: string;
  }