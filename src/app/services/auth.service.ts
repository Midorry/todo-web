import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAccessToken() {
    return localStorage.getItem('token'); // access token
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  loadUsers() {
    this.http
      .get<User[]>(`${this.apiUrl}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .subscribe((users) => {
        this.usersSubject.next(users);
      });
  }

  login(
    userData: any
  ): Observable<{ user: User; accessToken: string; refreshToken: string }> {
    return this.http.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(`${this.apiUrl}/auth/login`, userData);
  }

  register(userData: any): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}/auth/register`, userData)
      .pipe(tap(() => this.loadUsers()));
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<any>(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        map((response) => {
          localStorage.setItem('token', response.accessToken);
          return response.accessToken;
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // Có thể gọi BE để xóa refresh token
  }
}
