import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ErrorService } from './services/error.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);

  return next(req).pipe(
    catchError((error) => {
      // Only set global error if it's a connection issue or 5xx server error,
      // avoiding capturing normal 400 validation errors here.
      if (error.status === 0 || error.status >= 500) {
        errorService.setServerError("Impossible de contacter le serveur distant. Veuillez vérifier votre connexion ou réessayer plus tard.");
      }
      return throwError(() => error);
    })
  );
};
