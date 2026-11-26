import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-navigation',
  imports: [RouterLink],
  templateUrl: './site-navigation.html',
  styleUrl: './site-navigation.css',
})
export class SiteNavigation {
  readonly showMobileNavigation = input(true);

  protected readonly navigation = [
    { label: 'Home', icon: 'home' },
    { label: 'Meal Plan', icon: 'meal-plan' },
    { label: 'Groceries', icon: 'groceries' },
    { label: 'Favorites', icon: 'favorites' },
    { label: 'Account', icon: 'account' },
  ];
}
