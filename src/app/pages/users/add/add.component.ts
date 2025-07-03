import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { User } from 'src/app/model/user.model';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddUserComponent {
  @Input() visible = false;
  @Output() cancel = new EventEmitter<void>();
  addUserForm!: FormGroup<{
    userName: FormControl<string | null>;
    email: FormControl<string | null>;
    role: FormControl<string | null>;
    password: FormControl<string | null>;
    confirmPassword: FormControl<string | null>;
  }>;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notification: NotificationService
  ) {}
  ngOnInit(): void {
    this.addUserForm = this.fb.group({
      userName: this.fb.control<string | null>('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
      ]),
      email: this.fb.control<string | null>('', [
        Validators.required,
        Validators.email,
      ]),
      role: this.fb.control<string | null>('', [Validators.required]),
      password: this.fb.control<string | null>('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: this.fb.control<string | null>('', [
        Validators.required,
        this.matchOtherValidator('password'),
      ]),
    }) as FormGroup<{
      userName: FormControl<string | null>;
      email: FormControl<string | null>;
      role: FormControl<string | null>;
      password: FormControl<string | null>;
      confirmPassword: FormControl<string | null>;
    }>;
  }

  onSubmit(): void {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();

      //Rất quan trọng: Bắt buộc cập nhật trạng thái validators cho các control
      Object.values(this.addUserForm.controls).forEach((control) => {
        control.updateValueAndValidity();
      });

      return;
    }

    const newUser: User = {
      userName: this.addUserForm.value.userName || '',
      email: this.addUserForm.value.email || '',
      role: this.addUserForm.value.role || '',
      password: this.addUserForm.value.password || '',
    };

    this.userService.createUser(newUser).subscribe({
      next: () => {
        this.cancel.emit();
        this.visible = false;
        this.notification.show('Thêm mới thành công', 'success');
        this.addUserForm.reset();
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

  matchOtherValidator(otherControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;

      const otherControl = control.parent.get(otherControlName);
      if (!otherControl) return null;

      return control.value === otherControl.value
        ? null
        : { confirmMismatch: true };
    };
  }
}
