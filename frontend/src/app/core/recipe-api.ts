import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface RecipeCard {
  readonly id: number;
  readonly title: string;
  readonly coverImagePath: string;
  readonly totalMinutes: number;
  readonly servings: number;
  readonly averageRating: number | null;
  readonly ratingCount: number;
  readonly createdAt: string;
}

export interface RecipeDetails extends RecipeCard {
  readonly description: string | null;
  readonly ingredients: readonly {
    readonly position: number;
    readonly name: string;
    readonly quantity: number | null;
    readonly unit: string | null;
    readonly notes: string | null;
  }[];
  readonly steps: readonly {
    readonly position: number;
    readonly title: string | null;
    readonly instructions: string;
  }[];
}

export function recipeImageUrl(path: string): string {
  return /^(?:https?:)?\/\//i.test(path) ? path : '/api/' + path.replace(/^\/+/, '');
}

export interface PantryRecipes {
  readonly ingredients: readonly { readonly id: number; readonly name: string }[];
  readonly recipes: readonly RecipeCard[];
}

@Injectable({ providedIn: 'root' })
export class RecipeApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/dishly/recipe';

  getCards(sort: 'rating' | 'newest') {
    const url = sort === 'rating' ? this.baseUrl + '/rated' : this.baseUrl;
    return this.http.get<RecipeCard[]>(url);
  }

  getDetails(id: string) {
    return this.http.get<RecipeDetails>(this.baseUrl + '/' + encodeURIComponent(id));
  }

  getPantryRecipes() {
    return this.http.get<PantryRecipes>(this.baseUrl + '/from-my-ingredients');
  }
}
