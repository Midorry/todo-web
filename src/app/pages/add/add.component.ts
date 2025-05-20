import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Todo } from 'src/app/model/todo.model';
import { ToDoService } from 'src/app/services/todo.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddComponent implements OnInit {
  date = null;
  @Input() visible = false;
  @Output() cancel = new EventEmitter<void>();
  addForm!: FormGroup<{
    task: FormControl<string | null>;
    priority: FormControl<string | null>;
    deadline: FormControl<Date | null>;
    tags: FormControl<Array<string> | null>;
  }>;
  constructor(private fb: FormBuilder, private todoService: ToDoService) {}
  ngOnInit(): void {
    this.addForm = this.fb.group({
      task: this.fb.control<string | null>('', [
        Validators.required,
        Validators.minLength(1),
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
    if (this.addForm.valid) {
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
          this.addForm.reset();
        },
        error: (err) => {
          console.log('Thêm mới thất bại: ', err);
        },
      });
    } else {
      console.log('Lỗi');
      this.addForm.markAllAsTouched();
    }
  }
  onCancel(): void {
    this.cancel.emit();
    this.visible = false;
  }
}
