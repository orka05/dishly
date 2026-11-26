import { Component, signal } from '@angular/core';
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
  protected readonly activeTab = signal(0);

  protected moveTabFocus(event: KeyboardEvent): void {
    const tab = event.target;
    if (!(tab instanceof HTMLButtonElement) || tab.getAttribute('role') !== 'tab') {
      return;
    }

    const last = this.sections.length - 1;
    const current = this.activeTab();
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = current === last ? 0 : current + 1;
        break;
      case 'ArrowLeft':
        next = current === 0 ? last : current - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.activeTab.set(next);
    tab.parentElement?.querySelectorAll('button')[next]?.focus();
  }
}
