import { Component, OnInit } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { Todo } from 'src/app/model/todo.model';
import { ToDoService } from 'src/app/services/todo.service';

interface ColumnItem {
  title: string;
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
export class ListComponent implements OnInit {
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
    {
      title: 'Id',
      compare: (a: Todo, b: Todo) => a.id! - b.id!,
      priority: 3,
    },
    {
      title: 'Tiêu đề',
      compare: (a: Todo, b: Todo) => a.title.localeCompare(b.title),
      priority: 2,
    },
    {
      title: 'Tiến độ',
      listOfFilter: [
        { text: 'Chưa hoàn thành', value: 'false' },
        { text: 'Hoàn thành', value: 'true' },
      ],
      filterFn: (selected: string[], item: Todo) =>
        selected.includes(String(item.completed)),
    },
    {
      title: 'Độ ưu tiên',
      compare: (a: Todo, b: Todo) => a.priority.localeCompare(b.priority),
      priority: 1,
    },
    {
      title: 'Thời hạn',
      compare: (a: Todo, b: Todo) => a.deadline.localeCompare(b.deadline),
      priority: 4,
    },
    {
      title: 'Loại công việc',
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
    },
    {
      title: 'Hành động',
    },
  ];

  // Multi-select
  listOfCurrentPageData: readonly Todo[] = [];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  listOfSelection = [
    {
      text: 'Select All Row',
      onSelect: () => this.onAllChecked(true),
    },
    {
      text: 'Select Odd Row',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) =>
          this.updateCheckedSet(data.id || 0, index % 2 !== 0)
        );
        this.refreshCheckedStatus();
      },
    },
    {
      text: 'Select Even Row',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) =>
          this.updateCheckedSet(data.id || 0, index % 2 === 0)
        );
        this.refreshCheckedStatus();
      },
    },
  ];

  // Confirm dialog
  showConfirm = false;
  confirmMessage = '';
  confirmCallback: (() => void) | null = null;

  // Edit & Add dialog
  showEdit = false;
  showAdd = false;
  idOfTodo = '';
  dataDetail!: Todo;

  constructor(private toDoService: ToDoService) {
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
        this.events = this.listOfData.map((todo) => ({
          start: new Date(todo.deadline),
          title: todo.title,
          color: todo.completed ? this.colors.green : this.colors.red,
        }));
      });
  }
  colors: any = {
    red: {
      primary: '#ad2121',
      secondary: '#FAE3E3',
    },
    green: {
      primary: '#0f9d58',
      secondary: '#C6F6D5',
    },
    blue: {
      primary: '#1e90ff',
      secondary: '#D1E8FF',
    },
  };

  viewDate = new Date(); // ngày đang hiển thị
  events: any;

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

  ngOnInit() {
    this.checkTodosDeadline(); // check lần đầu
    setInterval(() => this.checkTodosDeadline(), 3600 * 1000); // mỗi giờ
  }

  checkTodosDeadline() {
    this.toDoService.todos$.subscribe((todos) => {
      todos.forEach((todo) => {
        this.checkDeadlineStatus(todo.deadline);
      });
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
  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.id || 0, value)
    );
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange($event: readonly Todo[]): void {
    this.listOfCurrentPageData = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.id || 0)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.id || 0)
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
        next: (data) => (this.dataDetail = data),
        error: (err) => console.error('Lỗi lấy chi tiết todo: ', err),
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
        next: () => console.log('Xóa thành công'),
        error: (err) => console.error('Xóa thất bại:', err),
      });
    });
  }

  onDeleteMultiple() {
    this.openConfirm(
      'Bạn có chắc chắn muốn xóa những công việc này không?',
      () => {
        const deleteRequests = Array.from(this.setOfCheckedId).map((id) =>
          this.toDoService.deleteTodo(id)
        );

        forkJoin(deleteRequests).subscribe({
          next: () => {
            console.log('Xóa nhiều thành công');
            this.setOfCheckedId.clear();
          },
          error: (err) => {
            console.error('Xóa nhiều thất bại: ', err);
          },
        });
      }
    );
  }
}
