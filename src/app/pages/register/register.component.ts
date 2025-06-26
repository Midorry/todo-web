import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/model/user.model';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: [
      '',
      [Validators.required, this.matchOtherValidator('password')],
    ],
  });

  submitForm(): void {
    if (this.registerForm.valid) {
      console.log('submit', this.registerForm.value);
      const userData: User = {
        email: this.registerForm.value.email || '',
        password: this.registerForm.value.password || '',
      };

      this.userService.register(userData).subscribe({
        next: (res) => {
          if (res === 'EXISTS') {
            this.notification.show(
              'Email đã được đăng ký, vui lòng dùng email khác',
              'error'
            );
          } else {
            this.notification.show('Đăng ký thành công', 'success');
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          console.log('Đăng ký thất bại: ', err);
          this.notification.show('Đăng ký thất bại', 'error');
        },
      });
    } else {
      Object.values(this.registerForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
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

  constructor(
    private fb: NonNullableFormBuilder,
    private userService: UserService,
    private notification: NotificationService,
    private router: Router
  ) {}
}
