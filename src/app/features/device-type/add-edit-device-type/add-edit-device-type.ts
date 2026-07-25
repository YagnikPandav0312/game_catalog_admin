import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeviceTypeService } from '../../../core/services/device-type';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { DeviceTypeList } from '../../../model/device-type.model';

@Component({
  selector: 'app-add-edit-device-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-device-type.html',
  styleUrl: './add-edit-device-type.scss',
})
export class AddEditDeviceType implements OnInit {
  @Input() deviceType: any = null;
  @Output() close = new EventEmitter<boolean>();
  form!: FormGroup;
  submitted = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  private deviceTypeService = inject(DeviceTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.deviceType) {
      this.isEditMode.set(true);
      this.form.patchValue({
        device_type_name: this.deviceType.device_type_name,
        slug: this.deviceType.slug || '',
      });
    } else {
      this.isEditMode.set(false);
    }
  }

  initForm(): void {
    this.form = new FormGroup({
      device_type_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      slug: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
    });
    this.submitted.set(false);
    this.form.get('device_type_name')?.valueChanges.subscribe((name) => {
      if (!this.isEditMode() && name) {
        const slug = this.slugify(name);
        this.form.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });
  }

  slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, ''); // Trim - from end
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
      device_type_name: this.form.get('device_type_name')?.value,
      slug: this.form.get('slug')?.value,
      user_id: this.commonService.getUserId() || 0,
    };

    if (this.isEditMode()) {
      payload.device_type_id = this.deviceType.device_type_id;
      this.commonService.showSpinner();
      this.deviceTypeService.updateDeviceType(payload).subscribe({
        next: (res: BaseResponse<DeviceTypeList>) => {
          this.commonService.hideSpinner();
          if (res && res.status.code === 0) {
            this.commonService.hideSpinner();
            this.commonService.manageStatus(res.status);
            this.close.emit(true);
          } else {
            this.commonService.hideSpinner();
            this.commonService.manageStatus(res.status);
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.status?.message || 'An error occurred while updating device type');
        },
      });
    } else {
      this.deviceTypeService.createDeviceType(payload).subscribe({
        next: (res: BaseResponse<DeviceTypeList>) => {
          this.commonService.hideSpinner();
          if (res && res.status.code === 0) {
            this.close.emit(true);
            this.commonService.hideSpinner();
            this.commonService.manageStatus(res.status);
          } else {
            this.commonService.hideSpinner();
            this.commonService.manageStatus(res.status);
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.status?.message || 'An error occurred while creating device type');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
