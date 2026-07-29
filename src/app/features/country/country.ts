import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountryService } from '../../core/services/country';
import { Common } from '../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { AddEditCountry } from './add-edit-country/add-edit-country';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { BaseResponse } from '../../model/api.model';
import { Confirm } from '../../shared/component/confirm/confirm';
import { CountryList } from '../../model/country.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-country',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './country.html',
  styleUrl: './country.scss',
})
export class Country implements OnInit {
  countries = signal<CountryList[]>([]);
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);
  sort_by = signal<string>('country_id');
  sort_order = signal<string>('DESC');

  showingFrom = computed(() => {
    if (this.countries().length === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });
  showingTo = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  });

  private countryService = inject(CountryService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);
  private destroyRef = inject(DestroyRef);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.GetCountryList();
    });
  }

  ngOnInit(): void {
    this.GetCountryList();
  }

  GetCountryList(): void {
    this.commonService.showSpinner();
    const pagination: any = {
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchQuery()?.trim() || '',
      sort_by: this.sort_by(),
      sort_order: this.sort_order(),
      user_id: this.commonService.getUserId() || 0
    };
    this.countryService.getCountries(pagination).subscribe({
      next: (res: BaseResponse<CountryList[]>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.countries.set(res.data || []);
          this.totalItems.set(res.total_records || 0);
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err: any) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.status?.message || 'Error occurred while loading countries');
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onPageChange(p: number): void {
    this.currentPage.set(p);
    this.GetCountryList();
  }

  openFormModal(item?: CountryList): void {
    const modalRef = this.modalService.open(AddEditCountry, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.country = item || null;
    modalRef.componentInstance.close.subscribe((isSaved?: boolean) => {
      if (isSaved) {
        this.GetCountryList();
      }
      modalRef.close();
    });
  }

  onDeleteCountry(country: CountryList): void {
    const modalRef = this.modalService.open(Confirm, {
      centered: true,
      backdrop: 'static',
      size: 'md',
    });
    modalRef.componentInstance.title = 'Delete Country';
    modalRef.componentInstance.message = `Are you sure you want to delete "${country.country_name}"?`;
    modalRef.componentInstance.onClose.subscribe((returnData: any) => {
      if (returnData) {
        this.commonService.showSpinner();
        const payload: any = {
          country_id: country.country_id,
          user_id: this.commonService.getUserId() || 0,
        };
        this.countryService.deleteCountry(payload).subscribe({
          next: (res: BaseResponse<any>) => {
            this.commonService.hideSpinner();
            if (res.status.code === 0) {
              this.commonService.manageStatus(res.status);
              if (this.countries().length === 1 && this.currentPage() > 1) {
                this.currentPage.update((p) => p - 1);
              }
              this.GetCountryList();
            } else {
              this.commonService.manageStatus(res.status);
            }
          },
          error: (err) => {
            this.commonService.hideSpinner();
            this.toastr.error(err.error?.status?.message || 'Error occurred while deleting country');
          },
        });
      }
      modalRef.close();
    });
  }

  onToggleStatus(country: CountryList): void {
    this.commonService.showSpinner();
    const payload: any = {
      country_id: country.country_id,
      status: !country.is_active,
      user_id: this.commonService.getUserId() || 0,
    };
    this.countryService.updateCountryStatus(payload).subscribe({
      next: (res: BaseResponse<any>) => {
        this.commonService.hideSpinner();
        if (res.status.code === 0) {
          this.commonService.manageStatus(res.status);
          this.GetCountryList();
        } else {
          this.commonService.manageStatus(res.status);
        }
      },
      error: (err) => {
        this.commonService.hideSpinner();
        this.toastr.error(err.error?.status?.message || 'Error occurred while updating country status');
      },
    });
  }

  sort(column: string) {
    if (this.sort_by() === column) {
      this.sort_order.update(sort_order => sort_order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sort_by.set(column);
      this.sort_order.set('ASC');
    }
    this.GetCountryList();
  }
}
