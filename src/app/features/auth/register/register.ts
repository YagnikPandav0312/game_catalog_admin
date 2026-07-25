import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../../core/services/auth';
import { Common } from '../../../core/services/common';
import { BaseResponse } from '../../../model/api.model';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm!: FormGroup;
  submitted = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  public commonService = inject(Common);
  private toastr = inject(ToastrService);

  constructor(
    private authService: Auth,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      full_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('user', [Validators.required]),
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.commonService.showSpinner();
    this.authService.register(this.registerForm.value).subscribe({
      next: (res: BaseResponse<any>) => {
        this.commonService.hideSpinner();
        if (res && res.status.code === 0) {
          this.commonService.manageStatus(res.status);
          this.router.navigate(['/login']);
          this.submitted.set(false);
        } else {
          this.toastr.error(res.status.message || 'Registration failed!', 'Error');
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.status?.message || err.message || 'Error User Registration:', 'Error');
        this.commonService.hideSpinner();
        this.submitted.set(false);
      },
    });
  }
}
