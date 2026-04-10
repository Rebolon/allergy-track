import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { PERSISTENCE_ADAPTER } from './services/persistence/persistence.interface';
import { PocketbaseAdapterService } from './services/persistence/pocketbase-adapter.service';
import { AUTH_ADAPTER } from './services/adapters/auth.adapter';
import { MockAuthAdapter } from './services/adapters/mock-auth.adapter';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately'
    }),
    { provide: AUTH_ADAPTER, useClass: MockAuthAdapter },
    { provide: PERSISTENCE_ADAPTER, useClass: PocketbaseAdapterService }
  ],
};
