import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Todo } from '../model/todo.model';

@Injectable({ providedIn: 'root' })
export class ToDoService {
  private apiUrl = 'http://localhost:3000/todos';

  private todosSubject = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject.asObservable();
  constructor(private http: HttpClient) {
    this.loadTodos();
  }
  loadTodos() {
    this.http.get<Todo[]>(this.apiUrl).subscribe((todos) => {
      this.todosSubject.next(todos);
    });
  }
  addTodo(newTodo: any): Observable<Todo[]> {
    return this.http.post<Todo[]>(this.apiUrl, newTodo).pipe(
      tap(() => this.loadTodos()) // Tự động reload danh sách sau khi thêm
    );
  }
  deleteTodo(id: any): Observable<Todo[]> {
    return this.http.delete<Todo[]>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadTodos()) // Tự động reload danh sách sau khi thêm
    );
  }
  getTodoDetail(id: any): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadTodos()) // Tự động reload danh sách sau khi thêm
    );
  }
  updateTodo(id: any, updateData: any): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${id}`, updateData).pipe(
      tap(() => this.loadTodos()) // Tự động reload danh sách sau khi thêm
    );
  }
}
