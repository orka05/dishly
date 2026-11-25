import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoogleButton } from './components/google-button/google-button';
import { TextField } from './components/text-field/text-field';

@NgModule({
  declarations: [TextField, GoogleButton],
  imports: [CommonModule],
  exports: [TextField, GoogleButton],
})
export class SharedModule {}
