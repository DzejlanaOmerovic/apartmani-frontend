import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { authInterceptor } from './core/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // withComponentInputBinding: parametri iz adrese (npr. :sifra) stižu u komponentu kao input()
    provideRouter(routes, withComponentInputBinding()),
    // HttpClient + interceptor koji dodaje token uz svaki zahtev
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
