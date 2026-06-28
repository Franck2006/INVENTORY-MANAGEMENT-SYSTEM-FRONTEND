import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { GeneralModel, HardCodedDataInterface } from '../../models/general-model.type';
import { environment } from '../environment/env.environment';

const USER_KEY = 'user';
const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';
const USER_ROLE = 'role';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  private readonly user = signal<any | null>(null);
  private readonly refresh_token = signal<string | null>(null);
  private readonly access_token = signal<string | null>(null);
  private readonly user_role = signal<string | null>(null);

  signIn(signInCreadetial: GeneralModel.SignInCreadentials) {
    const URL = '';

    return this.http
      .post<string>(environment.LOCAL_BACKEND_URL + '/auth/sign-in', signInCreadetial)
      .pipe(
        tap((data: any) => {
          this.storeUser(data.user);
          this.storeAccessToken(data.access_token);
          this.storeRefreshToken(data.access_token);
        }),
      );
  }

  signUp(signUpCreadetial: GeneralModel.SignUpCreadentials) {
    return this.http.post<string>(environment.LOCAL_BACKEND_URL + '/auth/sign-up', signUpCreadetial).pipe(
      tap((data: any) => {
        this.storeUser(data.user);
        this.storeAccessToken(data.access_token);
        this.storeRefreshToken(data.access_token);
      }),
    );
  }

  refresToken(refreshToken: string | undefined) {
    return this.http.post<HardCodedDataInterface.TokenModels>(
      'this is the place of the url' + '/auth/refresh-token',
      refreshToken,
    );
  }

  storeUser(user: any) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  storeAccessToken(access_token: string) {
    localStorage.setItem(ACCESS_TOKEN, JSON.stringify(access_token));
    this.user.set(access_token);
  }

  storeRefreshToken(refresh_token: string) {
    localStorage.setItem(REFRESH_TOKEN, JSON.stringify(refresh_token));
    this.user.set(refresh_token);
  }

  storeUserRole(user_role: string) {
    localStorage.setItem(USER_ROLE, user_role);
    this.user_role.set(user_role);
  }

  getUser(): any {
    return localStorage.getItem(USER_KEY);
  }

  getAccessToken(): string {
    return localStorage.getItem(ACCESS_TOKEN) || '';
  }

  getRefreshToken(): string {
    return localStorage.getItem(REFRESH_TOKEN) || '';
  }

  getUserRole(): string {
    return localStorage.getItem(USER_ROLE) || '';
  }

  clearLocalStorage() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USER_ROLE);

    this.user.set(null);
    this.access_token.set(null);
    this.refresh_token.set(null);
    this.user_role.set(null);

    this.router.navigate(['/sign-in']);
  }

  getUserWorkSpace(user_role: string): string {
    switch (user_role) {
      case 'USER':
        return 'landing-page';
      case 'STUDENT':
        return 'student-profile';

      case 'COACH':
        return 'coach-profile';

      default:
        return 'sign-in';
    }
  }
}
