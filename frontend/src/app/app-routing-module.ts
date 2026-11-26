import { inject, NgModule } from '@angular/core';
import { RedirectCommand, ResolveFn, Router, RouterModule, Routes } from '@angular/router';
import { Meal, mealSections } from './features/home-page/meal-sections';

const resolveRecipe: ResolveFn<Meal> = (route) => {
  const slug = route.paramMap.get('slug');
  const recipe = mealSections.flatMap((section) => section.meals).find((meal) => meal.image === slug);
  return recipe ?? new RedirectCommand(inject(Router).createUrlTree(['/']));
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home-page/home-page').then((module) => module.HomePage),
  },
  {
    path: 'recipes/:slug',
    loadComponent: () => import('./features/recipe-page/recipe-page').then((module) => module.RecipePage),
    resolve: { recipe: resolveRecipe },
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth-module').then((module) => module.AuthModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      bindToComponentInputs: true,
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
