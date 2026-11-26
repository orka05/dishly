import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { RecipeApi, RecipeCard } from '../../core/recipe-api';
import { SiteNavigation } from '../../layout/site-navigation/site-navigation';
import { MealCard } from './meal-card/meal-card';

type RecipeListState =
  | { readonly status: 'loading' | 'error' | 'unavailable' }
  | { readonly status: 'ready'; readonly cards: readonly RecipeCard[] };

@Component({
  selector: 'app-home-page',
  imports: [SiteNavigation, MealCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly recipes = inject(RecipeApi);
  protected readonly sections = [
    { id: 'popular', title: 'Popular', description: 'Highest-rated recipes', sort: 'rating' },
    { id: 'recent', title: 'Newest', description: 'Recently added recipes', sort: 'newest' },
    { id: 'ingredients', title: 'From my ingredients', description: 'Recipes you can make with your ingredients', sort: null },
  ] as const;
  protected readonly activeTab = signal(0);
  protected readonly results = toSignal(
    toObservable(this.activeTab).pipe(
      switchMap((index) => {
        const sort = this.sections[index].sort;
        if (!sort) return of<RecipeListState>({ status: 'unavailable' });

        return this.recipes.getCards(sort).pipe(
          map((cards): RecipeListState => ({ status: 'ready', cards })),
          catchError(() => of<RecipeListState>({ status: 'error' })),
          startWith<RecipeListState>({ status: 'loading' }),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as RecipeListState },
  );

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
