import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Todo } from 'src/app/model/todo.model';
import { NotificationService } from 'src/app/services/notification.service';
import { ToDoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddTodoComponent implements OnInit {
  date = null;
  @Input() visible = false;
  @Output() cancel = new EventEmitter<void>();
  addForm!: FormGroup<{
    task: FormControl<string | null>;
    priority: FormControl<string | null>;
    deadline: FormControl<Date | null>;
    tags: FormControl<Array<string> | null>;
  }>;
  constructor(
    private fb: FormBuilder,
    private todoService: ToDoService,
    private notification: NotificationService
  ) {}
  ngOnInit(): void {
    this.addForm = this.fb.group({
      task: this.fb.control<string | null>('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      priority: this.fb.control<string | null>('', [Validators.required]),
      deadline: this.fb.control<Date | null>(null, [Validators.required]),
      tags: this.fb.control<Array<string> | null>(null, [Validators.required]),
    }) as FormGroup<{
      task: FormControl<string | null>;
      priority: FormControl<string | null>;
      deadline: FormControl<Date | null>;
      tags: FormControl<Array<string> | null>;
    }>;
  }
  options: string[] = ['Học tập', 'Công việc', 'Giải trí', 'Gia đình'];
  filteredOptions: string[] = [...this.options];
  tags: string[] = [];

  onSearch(value: string): void {
    this.filteredOptions = this.options.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }
  onSubmit(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();

      //Rất quan trọng: Bắt buộc cập nhật trạng thái validators cho các control
      Object.values(this.addForm.controls).forEach((control) => {
        control.updateValueAndValidity();
      });

      return;
    }

    const newTodo: Todo = {
      title: this.addForm.value.task || '',
      deadline: this.addForm.value.deadline
        ? this.addForm.value.deadline.toISOString()
        : '',
      priority: this.addForm.value.priority || '',
      completed: false,
      tags: this.addForm.value.tags || [],
    };

    this.todoService.addTodo(newTodo).subscribe({
      next: () => {
        this.cancel.emit();
        this.visible = false;
        this.notification.show('Thêm mới thành công', 'success');
        this.addForm.reset();
      },
      error: (err) => {
        console.log('Thêm mới thất bại: ', err);
        this.notification.show('Thêm mới thất bại', 'error');
      },
    });
  }

  onCancel(): void {
    this.cancel.emit();
    this.visible = false;
  }
}
