import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Todo } from '../model/todo.model';

@Injectable({ providedIn: 'root' })
export class ToDoService {
  private apiUrl = 'http://localhost:3000/api/todos';

  private todosSubject = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTodos();
  }

  token = localStorage.getItem('token');

  // Lấy todos của user đang login
  loadTodos() {
    let userTodo;
    const userTodoString = localStorage.getItem('userTodo');
    if (userTodoString !== null) {
      userTodo = JSON.parse(userTodoString);
    } else {
      console.error('Chưa đăng nhập, không có userId');
      this.todosSubject.next([]); // clear list
      return;
    }
    if (!userTodo._id) {
      console.error('Chưa đăng nhập, không có userId');
      this.todosSubject.next([]); // clear list
      return;
    }

    this.http
      .get<Todo[]>(`${this.apiUrl}/user/${userTodo._id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .subscribe((todos) => {
        this.todosSubject.next(todos);
      });
  }

  resetTodos() {
    this.todosSubject.next([]); // Clear list về rỗng
  }

  addTodo(newTodo: any): Observable<Todo> {
    return this.http
      .post<Todo>(this.apiUrl, newTodo, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(tap(() => this.loadTodos()));
  }

  deleteTodo(id: string): Observable<Todo> {
    return this.http
      .delete<Todo>(`${this.apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(tap(() => this.loadTodos()));
  }

  getTodoDetail(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  updateTodo(id: string, updateData: any): Observable<Todo> {
    return this.http
      .put<Todo>(`${this.apiUrl}/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })
      .pipe(tap(() => this.loadTodos()));
  }
}
