import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth } from '../../../core/services/auth';
import { Common } from '../../../core/services/common';
import { BaseResponse } from '../../../model/api.model';
import { loginResponse } from '../../../model/account.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm!: FormGroup;
  submitted = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  public commonService = inject(Common);
  private toastr = inject(ToastrService);

  constructor(
    private authService: Auth,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loginForm = new FormGroup({
      user_name: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }

  onSubmit() {
    this.submitted.set(true);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.commonService.showSpinner();
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: BaseResponse<loginResponse>) => {
        if (res && res.status.code === 0) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.commonService.userData.set({
            user_id: res.data.user.user_id,
          });
          if (this.commonService.userData()?.user_id) {
            this.commonService.setUserId(Number(this.commonService.userData()?.user_id));
            localStorage.setItem(
              'userId',
              String(this.commonService.userData()?.user_id.toString()),
            );
          }
          this.router.navigate(['/dashboard']);
          this.submitted.set(false);
          this.commonService.hideSpinner();
          this.commonService.manageStatus(res.status);
        } else {
          this.commonService.hideSpinner();
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.status?.message || 'Error User Login', 'Error');
        this.submitted.set(false);
      },
    });
  }
}
