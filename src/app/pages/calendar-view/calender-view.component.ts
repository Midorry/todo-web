import { Component } from '@angular/core';
import { CalendarView } from 'angular-calendar';
import { ToDoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-calender-view',
  templateUrl: './calender-view.component.html',
  styleUrls: ['./calender-view.component.scss'],
})
export class CalenderViewComponent {
  viewDate = new Date(); // ngày đang hiển thị
  events: any;
  colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3',
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF',
    },
    yellow: {
      primary: '#e3bc08',
      secondary: '#FDF1BA',
    },
    green: {
      primary: 'green',
      secondary: '#abffab',
    },
  };

  activeDayIsOpen: boolean = true;
  view: CalendarView = CalendarView.Month;
  constructor(private todoService: ToDoService) {
    this.todoService.todos$.subscribe((todos) => {
      this.events = todos.map((todo) => ({
        start: new Date(todo.deadline),
        title: todo.title,
        color: todo.completed ? this.colors.blue : this.colors.red,
      }));
    });
  }
  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
