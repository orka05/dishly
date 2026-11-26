import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { recipeImageUrl, type RecipeCard } from '../../../core/recipe-api';

@Component({
  selector: 'li[app-meal-card]',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.css',
})
export class MealCard {
  readonly meal = input.required<RecipeCard>();
  readonly rank = input<number | null>(null);
  protected readonly imageUrl = computed(() => recipeImageUrl(this.meal().coverImagePath));
}
