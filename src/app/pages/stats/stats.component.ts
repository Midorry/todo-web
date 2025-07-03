import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Todo } from 'src/app/model/todo.model';
import { ToDoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent {
  todos$ = this.toDoService.todos$;
  listOfDisplayData: Todo[] = [];
  barChartData: any;
  constructor(private toDoService: ToDoService, private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      if (data['mode'] === 'admin') {
        this.toDoService.adminTodos$.subscribe((todos) => {
          this.listOfDisplayData = todos;
          this.updateCharts();
        });
      } else {
        this.toDoService.todos$.subscribe((todos) => {
          this.listOfDisplayData = todos;
          this.updateCharts();
        });
      }
    });
  }

  getCompletedStats() {
    const done = this.listOfDisplayData.filter((todo) => todo.completed).length;
    const pending = this.listOfDisplayData.length - done;
    return [done, pending];
  }

  getPriorityStats() {
    const priorities: { [key: string]: number } = {
      low: 0,
      medium: 0,
      high: 0,
    };
    this.listOfDisplayData.forEach((todo) => priorities[todo.priority]++);
    return [priorities['low'], priorities['medium'], priorities['high']];
  }
  getMonthlyCompletionStats() {
    const stats = Array.from({ length: 12 }, () => ({ done: 0, pending: 0 }));

    this.listOfDisplayData.forEach((todo) => {
      const month = new Date(todo.deadline).getMonth(); // từ 0 đến 11
      if (todo.completed) {
        stats[month].done += 1;
      } else {
        stats[month].pending += 1;
      }
    });

    return stats;
  }
  getBarChartData() {
    const stats = this.getMonthlyCompletionStats();

    return {
      labels: [
        'Tháng 1',
        'Tháng 2',
        'Tháng 3',
        'Tháng 4',
        'Tháng 5',
        'Tháng 6',
        'Tháng 7',
        'Tháng 8',
        'Tháng 9',
        'Tháng 10',
        'Tháng 11',
        'Tháng 12',
      ],
      datasets: [
        {
          label: 'Hoàn thành',
          data: stats.map((s) => s.done),
          backgroundColor: '#52c41a',
        },
        {
          label: 'Chưa hoàn thành',
          data: stats.map((s) => s.pending),
          backgroundColor: '#f5222d',
        },
      ],
    };
  }

  updateCharts() {
    this.completedChartData = {
      responsive: true,
      maintainAspectRatio: false,
      datasets: [
        {
          data: this.getCompletedStats(),
          backgroundColor: ['#52c41a', '#f5222d'],
        },
      ],
      labels: ['Hoàn thành', 'Chưa hoàn thành'],
    };

    this.barChartData = this.getBarChartData();
    this.priorityChartData = {
      labels: ['Thấp', 'Trung bình', 'Cao'],
      datasets: [
        {
          label: 'Độ ưu tiên',
          data: this.getPriorityStats(),
          backgroundColor: ['#91d5ff', '#faad14', '#f5222d'],
        },
      ],
    };

    this.barChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
      },
      scales: {
        x: {},
        y: {
          beginAtZero: true,
        },
      },
    };
  }

  completedChartData = {
    responsive: true,
    maintainAspectRatio: false,
    datasets: [
      {
        data: this.getCompletedStats(),
        backgroundColor: ['#52c41a', '#f5222d'],
      },
    ],
    labels: ['Hoàn thành', 'Chưa hoàn thành'],
  };

  priorityChartData = {
    labels: ['Thấp', 'Trung bình', 'Cao'],
    datasets: [
      {
        label: 'Độ ưu tiên',
        data: this.getPriorityStats(),
        backgroundColor: ['#91d5ff', '#faad14', '#f5222d'],
      },
    ],
  };

  barChartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {},
      y: {
        beginAtZero: true,
      },
    },
  };
}
