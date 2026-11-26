import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-google-button',
  standalone: false,
  templateUrl: './google-button.html',
  styleUrl: './google-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleButton {
  readonly label = input.required<string>();
}
