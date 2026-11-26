import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared-module';
import { AuthRoutingModule } from './auth-routing-module';
import { AuthLayout } from './components/auth-layout/auth-layout';
import { Login } from './pages/login/login';
import { SignUp } from './pages/sign-up/sign-up';

@NgModule({
  declarations: [Login, SignUp, AuthLayout],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, AuthRoutingModule],
})
export class AuthModule {}
