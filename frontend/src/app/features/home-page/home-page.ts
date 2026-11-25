import { Component } from '@angular/core';
import { SiteNavigation } from '../../layout/site-navigation/site-navigation';
import { MealCard } from './meal-card/meal-card';
import { mealSections } from './meal-sections';

@Component({
  selector: 'app-home-page',
  imports: [SiteNavigation, MealCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  protected readonly sections = mealSections;
}
