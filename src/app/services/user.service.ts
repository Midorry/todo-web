import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from '../model/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();
  // token = localStorage.getItem('token');

  constructor(private http: HttpClient) {
    // this.loadUsers();
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

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(tap(() => this.loadUsers()));
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(tap(() => this.loadUsers()));
  }

  updateUser(userData: any, id: string): Observable<User> {
    return this.http
      .put<User>(`${this.apiUrl}/${id}`, userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(tap(() => this.loadUsers()));
  }

  deleteUser(id: string): Observable<User> {
    return this.http
      .delete<User>(`${this.apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(tap(() => this.loadUsers()));
  }

  deleteMultipleUsers(ids: string[]): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: { ids }, // gửi body
      })
      .pipe(tap(() => this.loadUsers()));
  }

  createUser(userData: any): Observable<User> {
    return this.http
      .post<User>(`${this.apiUrl}`, userData)
      .pipe(tap(() => this.loadUsers()));
  }
}
