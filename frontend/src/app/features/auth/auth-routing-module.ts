import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ActivateAccount } from './pages/activate-account/activate-account';
import { Login } from './pages/login/login';
import { SignUp } from './pages/sign-up/sign-up';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login, title: 'Login | Dishly' },
  { path: 'sign-up', component: SignUp, title: 'Sign up | Dishly' },
  { path: 'activate', component: ActivateAccount, title: 'Account activation | Dishly' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
