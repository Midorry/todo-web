import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
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
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditComponent implements OnInit {
  @Input() visible = false;
  @Input() dataTodo!: Todo;
  @Output() cancel = new EventEmitter<void>();
  editForm!: FormGroup<{
    task: FormControl<string | null>;
    priority: FormControl<string | null>;
    deadline: FormControl<Date | null>;
    completed: FormControl<boolean | null>;
    tags: FormControl<Array<string> | null>;
  }>;
  constructor(
    private fb: FormBuilder,
    private todoService: ToDoService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.editForm = this.fb.group({
      task: this.fb.control<string | null>('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      priority: this.fb.control<string | null>('', [Validators.required]),
      deadline: this.fb.control<Date | null>(null, [Validators.required]),
      completed: this.fb.control<boolean | null>(false, [Validators.required]),
      tags: this.fb.control<Array<string> | null>(null, [Validators.required]),
    }) as FormGroup<{
      task: FormControl<string | null>;
      priority: FormControl<string | null>;
      deadline: FormControl<Date | null>;
      completed: FormControl<boolean | null>;
      tags: FormControl<Array<string> | null>;
    }>;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataTodo'] && this.dataTodo) {
      // set giá trị cho form khi dataTodo thay đổi
      this.editForm.patchValue({
        task: this.dataTodo.title,
        priority: this.dataTodo.priority,
        deadline: new Date(this.dataTodo.deadline.toString()),
        completed: Boolean(this.dataTodo.completed),
        tags: this.dataTodo.tags,
      });
    }
  }
  options: string[] = ['Học tập', 'Công việc', 'Giải trí', 'Gia đình'];
  filteredOptions: string[] = [...this.options];
  // tags: string[] = [];

  onSearch(value: string): void {
    this.filteredOptions = this.options.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }
  onSubmit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();

      // ⚠️ Rất quan trọng: Bắt buộc cập nhật trạng thái validators cho các control
      Object.values(this.editForm.controls).forEach((control) => {
        control.updateValueAndValidity();
      });

      return;
    }
    const updateTodo: Todo = {
      title: this.editForm.value.task || '',
      deadline: this.editForm.value.deadline
        ? this.editForm.value.deadline.toISOString()
        : '',
      priority: this.editForm.value.priority || '',
      completed: this.editForm.value.completed || false,
      tags: this.editForm.value.tags || [],
    };
    this.todoService.updateTodo(this.dataTodo.id, updateTodo).subscribe({
      next: () => {
        this.cancel.emit();
        this.visible = false;
        this.notification.show('Sửa thành công', 'success');
        this.editForm.reset();
      },
      error: (err) => {
        console.log('Sửa thất bại: ', err);

        this.notification.show('Sửa thất bại', 'error');
      },
    });
  }

  onCancel(): void {
    this.cancel.emit();
    this.visible = false;
  }
}
