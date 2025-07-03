import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
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
  selector: 'app-edit-user',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
})
export class EditUserComponent {
  @Input() visible = false;
  @Input() dataUser!: User;
  @Output() cancel = new EventEmitter<void>();
  editUserForm!: FormGroup<{
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
    this.editUserForm = this.fb.group({
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataUser'] && this.dataUser) {
      // set giá trị cho form khi dataUser thay đổi
      this.editUserForm.patchValue({
        userName: this.dataUser.userName,
        email: this.dataUser.email,
        role: this.dataUser.role,
      });
    }
  }

  onSubmit(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();

      //Rất quan trọng: Bắt buộc cập nhật trạng thái validators cho các control
      Object.values(this.editUserForm.controls).forEach((control) => {
        control.updateValueAndValidity();
      });

      return;
    }

    const newUser: User = {
      userName: this.editUserForm.value.userName || '',
      email: this.editUserForm.value.email || '',
      role: this.editUserForm.value.role || '',
      password: this.editUserForm.value.password || '',
    };

    this.userService.createUser(newUser).subscribe({
      next: () => {
        this.cancel.emit();
        this.visible = false;
        this.notification.show('Thêm mới thành công', 'success');
        this.editUserForm.reset();
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
