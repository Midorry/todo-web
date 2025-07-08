import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Todo } from '../model/todo.model';

@Injectable({ providedIn: 'root' })
export class ToDoService {
  private apiUrl = 'http://localhost:3000/api/todos';

  private todosSubject = new BehaviorSubject<Todo[]>([]);
  private adminTodosSubject = new BehaviorSubject<Todo[]>([]);

  adminTodos$ = this.adminTodosSubject.asObservable();
  todos$ = this.todosSubject.asObservable();
  // userTodo: any;
  // userTodoString = localStorage.getItem('userTodo');
  // userRole = localStorage.getItem('role');

  constructor(private http: HttpClient) {
    this.loadDataByRole();
    // console.log(this.userRole);
    // if (localStorage.getItem('role') === 'admin') {
    //   console.log(this.userRole);
    //   this.loadAdminTodos();
    // }
  }

  get userRole(): string | null {
    return localStorage.getItem('role');
  }

  /**
   * Lấy user đang đăng nhập từ localStorage
   */
  get userTodo(): any {
    const str = localStorage.getItem('userTodo');
    return str ? JSON.parse(str) : null;
  }

  loadDataByRole() {
    if (this.userTodo) this.loadTodos();
    if (this.userRole === 'admin') {
      this.loadAdminTodos();
    }
  }

  // Lấy todos của user đang login
  loadTodos() {
    // if (this.userTodo !== null) {
    //   this.userTodo = JSON.parse(userTodoString);
    // } else {
    //   console.error('Chưa đăng nhập, không có userId');
    //   this.todosSubject.next([]); // clear list
    //   return;
    // }
    if (!this.userTodo._id) {
      console.error('Chưa đăng nhập, không có userId');
      this.todosSubject.next([]); // clear list
      return;
    }

    this.http
      .get<Todo[]>(`${this.apiUrl}/user/${this.userTodo._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .subscribe((todos) => {
        this.todosSubject.next(todos);
      });
  }

  loadAdminTodos() {
    // if (!this.userTodo?._id) {
    //   this.userTodo = JSON.parse(localStorage.getItem('userTodo') || '{}');
    // }
    if (!this.userTodo?._id) {
      console.error('Chưa đăng nhập, không có userId');
      this.adminTodosSubject.next([]);
      return;
    }

    this.http
      .get<Todo[]>(`${this.apiUrl}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .subscribe((todos) => {
        this.adminTodosSubject.next(todos);
      });
  }

  resetTodos() {
    this.todosSubject.next([]); // Clear list về rỗng
  }

  addTodo(newTodo: any): Observable<Todo> {
    return this.http
      .post<Todo>(this.apiUrl, newTodo, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(tap(() => this.loadTodos()));
  }

  deleteTodo(id: string): Observable<Todo> {
    return this.http
      .delete<Todo>(`${this.apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(tap(() => this.loadTodos()));
  }

  deleteMultipleTodos(ids: string[]): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/todos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: { ids }, // gửi body
      })
      .pipe(tap(() => this.loadTodos()));
  }

  getAllTodo(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/user/${this.userTodo._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  getUserTodo(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/user/${this.userTodo._id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  getTodoDetail(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  updateTodo(id: string, updateData: any): Observable<Todo> {
    return this.http
      .put<Todo>(`${this.apiUrl}/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      .pipe(tap(() => this.loadTodos()));
  }
}
