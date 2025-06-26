import { Component, OnInit } from '@angular/core';
import { ToDoService } from 'src/app/services/todo.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all';

@Component({
  selector: 'app-calender-view',
  templateUrl: './calender-view.component.html',
  styleUrls: ['./calender-view.component.scss'],
})
export class CalenderViewComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    locales: allLocales,
    locale: 'vi', // the initial locale
    initialView: 'dayGridMonth', // dạng tháng
    events: [],
    height: 540,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    eventColor: '#3788d8', // màu mặc định nếu không đặt riêng từng event
    eventDisplay: 'block',
  };

  constructor(private todoService: ToDoService) {}

  ngOnInit(): void {
    this.todoService.todos$.subscribe((todos) => {
      const mappedEvents = todos.map((todo) => ({
        title: todo.title,
        date: todo.deadline,
        color: todo.completed ? '#52c41a' : '#f5222d', // xanh nếu hoàn thành, đỏ nếu chưa
      }));
      this.calendarOptions.events = mappedEvents;
    });
  }
}
