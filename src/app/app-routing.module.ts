import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListTodoComponent } from './pages/todos/list/list.component';
import { CalenderViewComponent } from './pages/calendar-view/calender-view.component';
import { StatsComponent } from './pages/stats/stats.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { authGuard } from './guards/auth.guard';
import { ListUserComponent } from './pages/users/list/list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  //Load một module riêng
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
    canActivate: [authGuard],
  },
  // Load Component, không có module riêng
  {
    path: 'list-todo',
    component: ListTodoComponent,
    canActivate: [authGuard],
    data: { mode: 'user' },
  },
  {
    path: 'list-all-todo',
    component: ListTodoComponent,
    canActivate: [authGuard],
    data: { mode: 'admin' },
  },
  {
    path: 'list-user',
    component: ListUserComponent,
    canActivate: [authGuard],
  },
  {
    path: 'calender',
    component: CalenderViewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'stats-user',
    component: StatsComponent,
    canActivate: [authGuard],
    data: { mode: 'user' },
  },
  {
    path: 'stats-all',
    component: StatsComponent,
    canActivate: [authGuard],
    data: { mode: 'admin' },
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
