import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor to add PocketBase authentication token to outgoing requests.
 * It reads the token from localStorage (compatible with PocketBase JS SDK default store).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authData = localStorage.getItem('pocketbase_auth');
  let token = '';

  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      token = parsed.token || '';
    } catch (e) {
      console.error('[AuthInterceptor] Failed to parse pocketbase_auth', e);
    }
  }

  if (token && req.url.startsWith('/api')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
