import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteNavigation } from '../../layout/site-navigation/site-navigation';
import type { Meal } from '../home-page/meal-sections';
import { recipeDetails } from './recipe-details';

@Component({
  selector: 'app-recipe-page',
  imports: [RouterLink, SiteNavigation],
  templateUrl: './recipe-page.html',
  styleUrl: './recipe-page.css',
})
export class RecipePage {
  readonly recipe = input.required<Meal>();
  protected readonly details = computed(() => recipeDetails[this.recipe().image]);
  protected readonly photo = computed(() => {
    const meal = this.recipe();
    return this.details()?.photo
      ?? `dishly/home/${meal.image}${meal.hasRankedPhoto ? '-unranked' : ''}.png`;
  });

}
