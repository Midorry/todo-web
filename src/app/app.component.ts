import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToDoService } from './services/todo.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isCollapsed = false;
  showLayout = true;

  get userRole() {
    return JSON.parse(localStorage.getItem('userTodo') || '{}').role;
  }

  constructor(
    private router: Router,
    private todoService: ToDoService,
    private authService: AuthService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide layout if current URL is /login
        this.showLayout = !['/login', '/register'].some((path) =>
          event.urlAfterRedirects.includes(path)
        );
      }
    });
  }
  logout() {
    this.todoService.resetTodos();
    this.authService.logout();
  }
}
