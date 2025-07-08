import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { User } from '../model/user.model';
import { Router } from '@angular/router';
import { ToDoService } from './todo.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

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
        }),
        catchError((err) => {
          console.error('Lỗi refreshAccessToken:', err);
          return throwError(() => err);
        })
      );
  }

  logout() {
    localStorage.removeItem('hasShownWelcomeNotification');
    localStorage.removeItem('role');
    localStorage.removeItem('userTodo');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
    const refreshToken = this.getRefreshToken();
    // Có thể gọi BE để xóa refresh token
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, { refreshToken });
  }
}
