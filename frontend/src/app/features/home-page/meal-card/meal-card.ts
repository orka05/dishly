import { Component, input } from '@angular/core';
import type { Meal } from '../meal-sections';

@Component({
  selector: 'li[app-meal-card]',
  templateUrl: './meal-card.html',
  styleUrl: './meal-card.css',
})
export class MealCard {
  readonly meal = input.required<Meal>();
}
