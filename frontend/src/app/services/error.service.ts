import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  serverError = signal<string | null>(null);

  setServerError(message: string) {
    this.serverError.set(message);
  }

  clearError() {
    this.serverError.set(null);
  }
}
