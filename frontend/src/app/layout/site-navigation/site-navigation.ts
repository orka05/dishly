import { NgTemplateOutlet } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-site-navigation',
  imports: [NgTemplateOutlet],
  templateUrl: './site-navigation.html',
  styleUrl: './site-navigation.css',
})
export class SiteNavigation {
  protected readonly navigation = [
    { label: 'Meal Plan', icon: 'meal-plan', available: true },
    { label: 'Groceries', icon: 'groceries', available: false },
    { label: 'Favorites', icon: 'favorites', available: false },
    { label: 'Account', icon: 'account', available: false },
  ];

  protected readonly menuOpen = signal(false);
}
