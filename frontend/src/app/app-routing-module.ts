import { HttpErrorResponse } from '@angular/common/http';
import { inject, NgModule } from '@angular/core';
import { ResolveFn, RouterModule, Routes } from '@angular/router';
import { catchError, of } from 'rxjs';
import { RecipeApi, RecipeDetails } from './core/recipe-api';

const resolveRecipe: ResolveFn<RecipeDetails | 'not-found' | 'error'> = (route) => {
  const id = route.paramMap.get('id');
  if (!id || !/^[1-9]\d*$/.test(id)) return 'not-found';

  return inject(RecipeApi).getDetails(id).pipe(
    catchError((error: HttpErrorResponse) =>
      of<'not-found' | 'error'>(error.status === 404 ? 'not-found' : 'error'),
    ),
  );
};

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home-page/home-page').then((module) => module.HomePage),
  },
  {
    path: 'recipes/:id',
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
