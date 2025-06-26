import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isCollapsed = false;
  showLayout = true;

  constructor(private router: Router) {
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
    localStorage.removeItem('userTodo');
    this.router.navigate(['/login']);
  }
}
