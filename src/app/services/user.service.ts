import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { User } from '../model/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3000/users';
  private allUsers: any;
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  register(userData: any): Observable<User | 'EXISTS'> {
    return this.getAllUsers().pipe(
      map((users) => {
        const existedUser = users.find((user) => user.email === userData.email);
        if (existedUser) {
          return 'EXISTS'; // tự quy định một lỗi đặc biệt
        }
        return null;
      }),
      switchMap((checkResult) => {
        if (checkResult === 'EXISTS') {
          return of('EXISTS' as 'EXISTS'); // 👈 ép kiểu literal
          // trả về ngay lỗi
        }
        // Nếu không tồn tại email → cho phép đăng ký
        return this.http.post<User>(`${this.apiUrl}`, userData);
      })
    );
  }

  login(userData: any): Observable<User[]> {
    const { email, password } = userData;
    const timestamp = new Date().getTime(); // thêm timestamp để tránh bị cache

    const url = `http://localhost:3000/users?email=${email}&password=${password}&ts=${timestamp}`;
    return this.http.get<User[]>(url);
  }
}
