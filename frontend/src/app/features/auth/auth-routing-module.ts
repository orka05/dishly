import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { guestGuard } from '../../core/guards/guest-guard';
import { ActivateAccount } from './pages/activate-account/activate-account';
import { Login } from './pages/login/login';
import { SignUp } from './pages/sign-up/sign-up';

const routes: Routes = [
  { path: 'login', component: Login, title: 'Login | Dishly', canActivate: [guestGuard] },
  { path: 'sign-up', component: SignUp, title: 'Sign up | Dishly', canActivate: [guestGuard] },
  { path: 'activate', component: ActivateAccount, title: 'Account activation | Dishly' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
