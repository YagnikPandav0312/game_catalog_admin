import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CountryService } from '../../../core/services/country';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { CountryList } from '../../../model/country.model';

@Component({
  selector: 'app-add-edit-country',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-country.html',
  styleUrl: './add-edit-country.scss',
})
export class AddEditCountry implements OnInit {
  @Input() country: CountryList | null = null;
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;
  submitted = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  private countryService = inject(CountryService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.country) {
      this.isEditMode.set(true);
      this.form.patchValue({
        country_name: this.country.country_name,
        country_code: this.country.country_code,
        flag: this.country.flag || '',
      });
    } else {
      this.isEditMode.set(false);
    }
  }

  initForm(): void {
    this.form = new FormGroup({
      country_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      country_code: new FormControl('', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(5),
        Validators.pattern(/^[A-Z]{2,5}$/)
      ]),
      flag: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    });
    this.submitted.set(false);
  }

  get f() {
    return this.form.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = {
      country_name: this.form.get('country_name')?.value,
      country_code: this.form.get('country_code')?.value,
      flag: this.form.get('flag')?.value,
      user_id: this.commonService.getUserId() || 0,
    };

    this.commonService.showSpinner();
    if (this.isEditMode()) {
      payload.country_id = this.country?.country_id;
      this.countryService.updateCountry(payload).subscribe({
        next: (res: BaseResponse<CountryList>) => {
          this.commonService.hideSpinner();
          if (res && res.status.code === 0) {
            this.close.emit(true);
            this.commonService.manageStatus(res.status);
          } else {
            this.commonService.manageStatus(res.status);
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.status?.message || 'An error occurred while updating country');
        },
      });
    } else {
      this.countryService.createCountry(payload).subscribe({
        next: (res: BaseResponse<CountryList>) => {
          this.commonService.hideSpinner();
          if (res && res.status.code === 0) {
            this.close.emit(true);
            this.commonService.manageStatus(res.status);
          } else {
            this.commonService.manageStatus(res.status);
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.status?.message || 'An error occurred while creating country');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
