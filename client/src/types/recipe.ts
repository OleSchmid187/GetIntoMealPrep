export interface Ingredient {
    id: number;
    name: string;
    price: number;
    caloriesPer100g: number;
    protein: number;
    fat: number;
    carbs: number;
    imageUrl?: string;
  }
  
  export interface Category {
    id: number;
    name: string;
  }
  
  export enum Difficulty {
    Easy = "Easy",
    Medium = "Medium",
    Hard = "Hard",
  }
  
  export interface Recipe {
    id: number;
    name: string;
    description?: string;
    instructions: string;
    portionCount: number;
    difficulty: Difficulty;
    caloriesPerServing: number;
    imageUrl?: string;
    ingredients?: {
      ingredient: Ingredient;
      quantity: number;
      unit: string;
    }[];
    categories?: {
      category: Category;
    }[];
  }
  