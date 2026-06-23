import { HttpErrorResponse, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { Auth } from '../services/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor {
  constructor(private authService: Auth) {}

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const access_token = this.authService.getAccessToken();
    let cloned_token = req;

    if (access_token) {
      cloned_token = req.clone({
        setHeaders: {
          Authorization: `Bearer ${access_token}`,
        },
      });
    }

    return next.handle(cloned_token).pipe(
      catchError((error: HttpErrorResponse) => {
        // 🔥 TOKEN EXPIRED
        if (error.status === 401) {
          return this.handleRefreshToken(cloned_token, next);
        }

        return throwError(() => error);
      }),
    );
  }

  public handleRefreshToken(req: HttpRequest<any>, next: HttpHandler) {
    const refreshToken = this.authService.getRefreshToken();

    return this.authService.refresToken(refreshToken!).pipe(
      switchMap((res: any) => {
        this.authService.storeRefreshToken(res.refresh_token);
        this.authService.storeAccessToken(res.access_token);

        const newReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${res.access_token}`,
          },
        });

        return next.handle(newReq);
      }),
    );
  }
}
