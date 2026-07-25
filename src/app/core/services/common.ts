import { inject, Injectable, signal } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Status } from '../../model/api.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Auth } from './auth';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Confirm } from '../../shared/component/confirm/confirm';

@Injectable({
  providedIn: 'root',
})
export class Common {
  public spinnerService = inject(NgxSpinnerService);
  private toastr = inject(ToastrService);
  public http: HttpClient;
  private userIdSubject = new BehaviorSubject<number | null>(null);
  userId$ = this.userIdSubject.asObservable();
  private authService = inject(Auth);
  private router = inject(Router);
  public modelService = inject(NgbModal);

  public isSidebarOpen = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth > 992 : true,
  );

  public userData = signal<any | null>(null);

  constructor() {
    const storedUser = localStorage.getItem('userData');

    if (storedUser) {
      this.userData.set(JSON.parse(storedUser));
    }

  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      this.isSidebarOpen.set(false);
    }
  }

  showSpinner(): void {
    this.spinnerService.show();
  }

  hideSpinner(): void {
    this.spinnerService.hide();
  }

  manageStatus(status: Status) {
    if (status.code === 0) {
      this.toastr.success(status.message);
    }

    if (status.code === 1) {
      this.toastr.warning(status.message);
    }

    if (status.code === 2) {
      this.toastr.error(status.message, 'Error');
    }
  }

  setUserId(id: number | null) {
    this.userIdSubject.next(id);
  }

  getUserId(): number | null {
    return this.userIdSubject.value || Number(localStorage.getItem('userId'));
  }

  logOut() {
    const modalRef = this.modelService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Logout';
    modalRef.componentInstance.message = 'Are you sure you want to logout ?';
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.authService.logout(this.getUserId()).subscribe({
          next: (res) => {
            localStorage.clear();
            this.router.navigate(['/login']);
            this.manageStatus(res.status);
          },
          error: (err) => {
            localStorage.clear();
            this.router.navigate(['/login']);
            this.toastr.error(err.error?.status?.message || 'Error occurred while Logout');
          }
        });
      }
      modalRef.close();
    });
  }

}
