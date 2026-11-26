import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Meal } from '../meal-sections';

@Component({
  selector: 'li[app-meal-card]',
  imports: [RouterLink],
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.css',
})
export class MealCard {
  readonly meal = input.required<Meal>();
  readonly ranked = input(false);
}
