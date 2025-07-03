import { Component } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import { User } from 'src/app/model/user.model';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

interface ColumnItem {
  title: string;
  width: string;
  compare?: ((a: User, b: User) => number) | false;
  priority?: number | boolean | null;
  listOfFilter?: { text: string; value: string }[] | false;
  filterFn?: ((selectedValues: string[], item: User) => boolean) | false;
}
@Component({
  selector: 'app-list-user',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListUserComponent {
  constructor(
    private userService: UserService,
    private notification: NotificationService
  ) {
    this.userService.users$.subscribe((users) => {
      this.listOfData = users;
      this.listOfDisplayData = users;
    });
  }

  ngOnInit(): void {
    this.userService.loadUsers();
  }

  searchValue: string = '';
  fieldsToSearch: string[] = ['userName', 'email'];
  availableFields = [
    { label: 'Tên người dùng', value: 'userName' },
    { label: 'Email', value: 'email' },
  ];
  dropdownOpen = false;

  // Display data
  listOfData: readonly User[] = [];
  listOfDisplayData: User[] = [];
  users$ = this.userService.users$;

  // Multi-select
  listOfCurrentPageData: readonly User[] = [];
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
  idOfUser = '';
  dataDetail!: User;

  countOverdue = 0;
  countUpcoming = 0;
  countNormal = 0;

  // Columns
  listOfColumn: ColumnItem[] = [
    {
      title: 'Tên người dùng',
      width: '100px',
      compare: (a: User, b: User) => a.userName!.localeCompare(b.userName!),
      priority: 2,
    },
    {
      title: 'Email',
      width: '130px',
      compare: (a: User, b: User) => a.email!.localeCompare(b.email!),
      // priority: 2,
    },
    {
      title: 'Vai trò',
      width: '80px',
      compare: (a: User, b: User) => a.role!.localeCompare(b.role!),
      // priority: 1,
    },
  ];

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

  onCurrentPageDataChange($event: readonly User[]): void {
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
      this.userService.getUserById(id).subscribe({
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
      this.userService.deleteUser(id).subscribe({
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
        this.userService.deleteMultipleUsers(idsToDelete).subscribe({
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
