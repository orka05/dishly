import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { PantryRecipes, RecipeApi, RecipeCard } from '../../core/recipe-api';
import { AuthSession } from '../../core/services/auth-session';
import { SiteNavigation } from '../../layout/site-navigation/site-navigation';
import { MealCard } from './meal-card/meal-card';

type RecipeListState =
  | { readonly status: 'loading' | 'error' | 'signed-out' }
  | {
      readonly status: 'ready';
      readonly cards: readonly RecipeCard[];
      readonly ingredients?: PantryRecipes['ingredients'];
    };

@Component({
  selector: 'app-home-page',
  imports: [SiteNavigation, MealCard, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly recipes = inject(RecipeApi);
  private readonly session = inject(AuthSession);
  protected readonly sections = [
    { id: 'popular', title: 'Popular', description: 'Highest-rated recipes', sort: 'rating' },
    { id: 'recent', title: 'Newest', description: 'Recently added recipes', sort: 'newest' },
    { id: 'ingredients', title: 'From my ingredients', description: 'Recipes you can make with your ingredients', sort: null },
  ] as const;
  protected readonly activeTab = signal(0);
  private readonly request = computed(() => ({
    sort: this.sections[this.activeTab()].sort,
    userId: this.session.user()?.id,
  }));
  protected readonly results = toSignal(
    toObservable(this.request).pipe(
      switchMap(({ sort, userId }) => {
        if (!sort && userId === undefined) return of<RecipeListState>({ status: 'signed-out' });

        const recipes = sort
          ? this.recipes.getCards(sort).pipe(
              map((cards): RecipeListState => ({ status: 'ready', cards })),
            )
          : this.recipes.getPantryRecipes().pipe(
              map(({ ingredients, recipes }): RecipeListState => ({
                status: 'ready', cards: recipes, ingredients,
              })),
            );
        return recipes.pipe(
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
