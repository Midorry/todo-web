import { Component, OnInit } from '@angular/core';
import { Todo } from 'src/app/model/todo.model';
import { ToDoService } from 'src/app/services/todo.service';
import { NotificationService } from 'src/app/services/notification.service';
import { take, filter } from 'rxjs';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent implements OnInit {
  userEmail: string | null = null;

  showAdd = false;
  totalTodos: number = 0;
  completedTodos: number = 0;
  overdueTodos: number = 0;
  upcomingTodos: number = 0;

  topImportantTodos: Todo[] = [];

  constructor(
    private todoService: ToDoService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // Lấy email để hiển thị lời chào
    const userEmailString = localStorage.getItem('userTodo');
    if (userEmailString !== null) {
      this.userEmail = JSON.parse(userEmailString).userName;
    }

    // Gọi loadTodos từ service để đảm bảo có data
    this.todoService.loadTodos();

    // Subscribe để hiển thị thống kê, update liên tục khi data thay đổi
    this.todoService.todos$.subscribe((todos) => {
      this.updateStats(todos);
    });

    // Khi login, chỉ muốn thông báo 1 lần → filter + take(1)
    const hasShown = localStorage.getItem('hasShownWelcomeNotification');
    if (hasShown !== 'true') {
      this.todoService.todos$
        .pipe(
          filter((todos) => todos.length > 0),
          take(1)
        )
        .subscribe((todos) => {
          this.checkAndNotify(todos);
          localStorage.setItem('hasShownWelcomeNotification', 'true');
        });
    }
  }

  onAdd(): void {
    this.showAdd = true;
  }

  onCancelAdd() {
    this.showAdd = false;
  }

  /**
   * Cập nhật thống kê số liệu
   */
  updateStats(todos: Todo[]) {
    this.totalTodos = todos.length;
    this.completedTodos = todos.filter((todo) => todo.completed).length;

    const now = new Date();
    this.overdueTodos = todos.filter(
      (todo) => new Date(todo.deadline).getTime() < now.getTime()
    ).length;

    // Trong 7 ngày tới
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);
    this.upcomingTodos = todos.filter((todo) => {
      const deadlineDate = new Date(todo.deadline);
      return deadlineDate > now && deadlineDate <= sevenDaysLater;
    }).length;

    // Top 3 công việc priority cao nhất
    this.topImportantTodos = todos
      .filter((todo) => todo.priority === 'high')
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      )
      .slice(0, 3);
  }

  /**
   * Thông báo khi login
   */
  checkAndNotify(todos: Todo[]) {
    const now = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(now.getDate() + 7);

    const countOverdue = todos.filter(
      (todo) => new Date(todo.deadline).getTime() < now.getTime()
    ).length;

    const countUpcoming = todos.filter((todo) => {
      const deadlineDate = new Date(todo.deadline);
      return deadlineDate > now && deadlineDate <= sevenDaysLater;
    }).length;

    if (countOverdue > 0) {
      this.notification.show(
        `Có ${countOverdue} công việc đã quá hạn`,
        'error'
      );
    }
    if (countUpcoming > 0) {
      this.notification.show(
        `Có ${countUpcoming} công việc gần đến hạn`,
        'warning'
      );
    }
    // if (todos.length > 0) {
    //   this.notification.show(
    //     `Bạn có ${todos.length - countOverdue} công việc cần làm`,
    //     'info'
    //   );
    // }
  }

  /**
   * Thêm mới công việc (có thể mở modal hoặc navigate)
   */
  onAddTodo() {
    console.log('Thêm mới công việc');
    // ví dụ: this.router.navigate(['/add']);
  }
}
