import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { recipeImageUrl, type RecipeDetails } from '../../core/recipe-api';
import { SiteNavigation } from '../../layout/site-navigation/site-navigation';

@Component({
  selector: 'app-recipe-page',
  imports: [RouterLink, SiteNavigation, DecimalPipe],
  templateUrl: './recipe-page.html',
  styleUrl: './recipe-page.css',
})
export class RecipePage {
  readonly recipe = input.required<RecipeDetails | 'not-found' | 'error'>();
  protected readonly imageUrl = computed(() => {
    const recipe = this.recipe();
    return typeof recipe === 'string' ? '' : recipeImageUrl(recipe.coverImagePath);
  });
}
