import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { Todo } from 'src/app/model/todo.model';
import { NotificationService } from 'src/app/services/notification.service';
import { ToDoService } from 'src/app/services/todo.service';

interface ColumnItem {
  title: string;
  width: string;
  compare?: ((a: Todo, b: Todo) => number) | false;
  priority?: number | boolean | null;
  listOfFilter?: { text: string; value: string }[] | false;
  filterFn?: ((selectedValues: string[], item: Todo) => boolean) | false;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListTodoComponent implements OnInit {
  // Search
  searchValue: string = '';
  fieldsToSearch: string[] = ['id', 'title'];
  availableFields = [
    { label: 'Id', value: 'id' },
    { label: 'Title', value: 'title' },
  ];
  dropdownOpen = false;

  // Display data
  listOfData: readonly Todo[] = [];
  listOfDisplayData: Todo[] = [];
  todos$ = this.toDoService.todos$.pipe(
    map((todos) => {
      return todos.map((todo) => ({
        ...todo,
        priority:
          todo.priority == 'low'
            ? 'Thấp'
            : todo.priority === 'medium'
            ? 'Trung bình'
            : 'Cao',
      }));
    })
  );

  // Columns
  listOfColumn: ColumnItem[] = [
    // {
    //   title: 'Id',
    //   width: '50px',
    //   compare: (a: Todo, b: Todo) => a._id!.localeCompare(b._id!),
    //   priority: 3,
    // },
    {
      title: 'Tiêu đề',
      width: '130px',
      compare: (a: Todo, b: Todo) => a.title.localeCompare(b.title),
      priority: 2,
    },
    {
      title: 'Tiến độ',
      width: '130px',
      listOfFilter: [
        { text: 'Chưa hoàn thành', value: 'false' },
        { text: 'Hoàn thành', value: 'true' },
      ],
      filterFn: (selected: string[], item: Todo) =>
        selected.includes(String(item.completed)),
    },
    {
      title: 'Độ ưu tiên',
      width: '120px',
      compare: (a: Todo, b: Todo) => a.priority.localeCompare(b.priority),
      priority: 1,
    },
    {
      title: 'Thời hạn',
      width: '140px',
      compare: (a: Todo, b: Todo) => a.deadline.localeCompare(b.deadline),
      priority: 4,
    },
    {
      title: 'Loại công việc',
      width: '170px',
      listOfFilter: [
        { text: 'Công việc', value: 'Công việc' },
        { text: 'Học tập', value: 'Học tập' },
        { text: 'Giải trí', value: 'Giải trí' },
        { text: 'Gia đình', value: 'Gia đình' },
      ],
      filterFn: (selected: string[], item: Todo) =>
        item.tags?.some((tag) => selected.includes(tag)),
    },
    {
      title: 'Thời hạn',
      width: '120px',
    },
    // {
    //   title: 'Hành động',
    //   width: '100px',
    // },
  ];

  // Multi-select
  listOfCurrentPageData: readonly Todo[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;

  // Confirm dialog
  showConfirm = false;
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  // Edit & Add dialog
  showEdit = false;
  showAdd = false;
  idOfTodo = '';
  dataDetail!: Todo;

  countOverdue = 0;
  countUpcoming = 0;
  countNormal = 0;

  constructor(
    private toDoService: ToDoService,
    private notification: NotificationService,
    private route: ActivatedRoute
  ) {}

  //Notification Deadline
  checkDeadlineStatus(deadline: string): 'overdue' | 'upcoming' | 'normal' {
    const now = new Date().getTime();
    const dueTime = new Date(deadline).getTime();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (dueTime < now) {
      return 'overdue';
    } else if (diffHours <= 24) {
      return 'upcoming';
    } else {
      return 'normal';
    }
  }

  checkDeadlineStatusNotification(deadline: string) {
    const now = new Date().getTime();
    const dueTime = new Date(deadline).getTime();
    const diffHours = (dueTime - now) / (1000 * 60 * 60);

    if (dueTime < now) {
      this.countOverdue += 1;
    } else if (diffHours <= 168) {
      this.countUpcoming += 1;
    } else {
      this.countNormal += 1;
    }
  }

  ngOnInit() {
    this.checkTodosDeadline(); // check lần đầu

    setInterval(() => this.checkTodosDeadline(), 3600 * 1000); // mỗi giờ
  }

  checkTodosDeadline() {
    this.countOverdue = 0;
    this.countUpcoming = 0;
    this.countNormal = 0;
    this.route.data.subscribe((data) => {
      if (data['mode'] === 'admin') {
        this.toDoService.adminTodos$
          .pipe(
            map((todos) =>
              todos.map((todo) => ({
                ...todo,
                priority:
                  todo.priority == 'low'
                    ? 'Thấp'
                    : todo.priority === 'medium'
                    ? 'Trung bình'
                    : 'Cao',
              }))
            )
          )
          .subscribe((todos) => {
            this.listOfData = todos;
            this.listOfDisplayData = todos;
            todos.forEach((todo) => {
              this.checkDeadlineStatusNotification(todo.deadline);

              this.checkDeadlineStatus(todo.deadline);
            });
          });
      } else {
        this.toDoService.todos$
          .pipe(
            map((todos) =>
              todos.map((todo) => ({
                ...todo,
                priority:
                  todo.priority == 'low'
                    ? 'Thấp'
                    : todo.priority === 'medium'
                    ? 'Trung bình'
                    : 'Cao',
              }))
            )
          )
          .subscribe((todos) => {
            this.listOfData = todos;
            this.listOfDisplayData = todos;
            todos.forEach((todo) => {
              this.checkDeadlineStatusNotification(todo.deadline);

              this.checkDeadlineStatus(todo.deadline);
            });
          });
      }
    });
  }

  // Search
  search() {
    const searchLower = this.searchValue.toLowerCase();
    this.listOfDisplayData = this.listOfData.filter((item) => {
      return this.fieldsToSearch.some((field) => {
        const fieldValue = (item as any)[field];
        return (
          fieldValue != null &&
          String(fieldValue).toLowerCase().includes(searchLower)
        );
      });
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onFieldChange(event: Event, value: string) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.fieldsToSearch.includes(value)) {
        this.fieldsToSearch.push(value);
      }
    } else {
      this.fieldsToSearch = this.fieldsToSearch.filter(
        (field) => field !== value
      );
    }
  }

  // Checkbox logic
  updateCheckedSet(id: string, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item._id!, value)
    );
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly Todo[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item._id!)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item._id!)
      ) && !this.checked;
  }

  // Confirm logic
  openConfirm(message: string, callback: () => void) {
    this.confirmMessage = message;
    this.confirmCallback = callback;
    this.showConfirm = true;
  }

  onConfirm() {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.showConfirm = false;
  }

  onCancel() {
    this.showConfirm = false;
  }

  // Edit/Add
  onEdit(id: any): void {
    this.showEdit = true;
    if (id) {
      this.toDoService.getTodoDetail(id).subscribe({
        next: (data) => {
          this.dataDetail = data;
          // this.notification.show('Lấy dữ liệu công việc thành công', 'success');
        },
        error: (err) => {
          console.error('Lỗi lấy dữ liệu công việc : ', err);
          // this.notification.show('Lấy công việc thất bại', 'error');
        },
      });
    }
  }

  onCancelEdit() {
    this.showEdit = false;
  }

  onAdd(): void {
    this.showAdd = true;
  }

  onCancelAdd() {
    this.showAdd = false;
  }

  // Delete
  onDelete(id: any): void {
    this.openConfirm('Bạn có chắc chắn muốn xóa không?', () => {
      this.toDoService.deleteTodo(id).subscribe({
        next: () => this.notification.show('Xóa thành công', 'success'),
        error: (err) => {
          console.error('Xóa thất bại:', err);
          this.notification.show('Xóa thất bại', 'error');
        },
      });
    });
  }

  onDeleteMultiple() {
    this.openConfirm(
      'Bạn có chắc chắn muốn xóa những công việc này không?',
      () => {
        const idsToDelete = Array.from(this.setOfCheckedId);

        this.toDoService.deleteMultipleTodos(idsToDelete).subscribe({
          next: () => {
            this.notification.show('Xóa thành công', 'success');
            this.setOfCheckedId.clear();
          },
          error: (err) => {
            this.notification.show('Xóa thất bại', 'error');
            console.error('Xóa nhiều thất bại: ', err);
          },
        });
      }
    );
  }
}
