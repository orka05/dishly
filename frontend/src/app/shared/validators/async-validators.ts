import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';

const DEBOUNCE_MS = 400;

/**
 * Creates an async validator that asks the server whether a value is still free.
 * Angular cancels the pending check on every keystroke, so the timer acts as a debounce.
 */
export function availabilityValidator(
  isAvailable: (value: string) => Observable<boolean>,
  errorKey: string,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value: string = control.value?.trim();
    if (!value) {
      return of(null);
    }
    return timer(DEBOUNCE_MS).pipe(
      switchMap(() => isAvailable(value)),
      map((available) => (available ? null : { [errorKey]: true })),
      // If the check fails, don't block the user; the server validates again on submit.
      catchError(() => of(null)),
    );
  };
}
