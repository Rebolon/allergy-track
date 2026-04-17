import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  isDevMode,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './error.interceptor';
import { authInterceptor } from './auth.interceptor';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { DAILY_LOGS_ADAPTER } from './services/daily-logs.interface';
import { PocketbaseDailyLogsAdapter } from './services/adapters/daily-logs/pocketbase/daily-logs.adapter';
import { PROTOCOL_ADAPTER } from './services/protocol.interface';
import { PocketbaseProtocolAdapter } from './services/adapters/protocol/pocketbase/protocol.adapter';
import { LocalStorageProtocolAdapter } from './services/adapters/protocol/local-storage/protocol.adapter';
import { AUTH_ADAPTER } from './services/auth.interface';
import { MockAuthAdapter } from './services/adapters/auth/local-storage/mock-auth.adapter';
import { PocketbaseAuthAdapter } from './services/adapters/auth/pocketbase/auth.adapter';
import { LocalStorageDailyLogsAdapter } from './services/adapters/daily-logs/local-storage/daily-logs.adapter';
import { SHARING_ADAPTER } from './services/sharing.interface';
import { LocalStorageSharingAdapter } from './services/adapters/sharing/local-storage/sharing.adapter';
import { PocketbaseSharingAdapter } from './services/adapters/sharing/pocketbase/sharing.adapter';
import { GAMIFICATION_ADAPTER } from './services/gamification.interface';
import { LocalStorageGamificationAdapter } from './services/adapters/gamification/local-storage/gamification.adapter';
import { PocketbaseGamificationAdapter } from './services/adapters/gamification/pocketbase/gamification.adapter';
import { environment } from '../environments/environment';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAnimationsAsync(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately'
    }),
    { 
      provide: AUTH_ADAPTER, 
      useClass: environment.useMockAuth ? MockAuthAdapter : PocketbaseAuthAdapter 
    },
    {
      provide: SHARING_ADAPTER,
      useClass: environment.useMockAuth ? LocalStorageSharingAdapter : PocketbaseSharingAdapter
    },
    { 
      provide: DAILY_LOGS_ADAPTER, 
      useClass: environment.useMockAuth ? LocalStorageDailyLogsAdapter : PocketbaseDailyLogsAdapter 
    },
    {
      provide: PROTOCOL_ADAPTER,
      useClass: environment.useMockAuth ? LocalStorageProtocolAdapter : PocketbaseProtocolAdapter
    },
    {
      provide: GAMIFICATION_ADAPTER,
      useClass: environment.useMockAuth ? LocalStorageGamificationAdapter : PocketbaseGamificationAdapter
    }
  ],
};
