import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProviderService } from '../../../core/services/provider';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { ProviderList } from '../../../model/provider.model';

@Component({
  selector: 'app-add-edit-providers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-providers.html',
  styleUrl: './add-edit-providers.scss',
})
export class AddEditProviders implements OnInit {
  @Input() provider: ProviderList | null = null;
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;
  submitted = signal<boolean>(false);
  logoPreview = signal<string | null>(null);
  selectedFile: File | null = null;
  isEditMode = signal<boolean>(false);

  private providerService = inject(ProviderService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.provider) {
      this.isEditMode.set(true);
      this.form.patchValue({
        provider_id: this.provider.provider_id,
        provider_name: this.provider.provider_name,
        slug: this.provider.slug || '',
        user_id: String(this.commonService.getUserId()),
      });
      if (this.provider.logo) {
        if (this.provider.logo.startsWith('http') || this.provider.logo.startsWith('data:')) {
          this.logoPreview.set(this.provider.logo);
        } else {
          this.logoPreview.set(`${this.provider.logo}`);
        }
      } else {
        this.logoPreview.set(null);
      }
    } else {
      this.isEditMode.set(false);
      this.logoPreview.set(null);
      this.selectedFile = null;
    }
  }

  initForm(): void {
    this.form = new FormGroup({
      provider_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      slug: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
      logo: new FormControl(null),
    });
    this.submitted.set(false);
    this.selectedFile = null;

    // Auto-generate slug from name if not in edit mode
    this.form.get('provider_name')?.valueChanges.subscribe((name) => {
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

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    if (this.isEditMode()) {
      formData.append('provider_id', String(this.provider?.provider_id));
    }
    formData.append('provider_name', this.form.get('provider_name')?.value);
    formData.append('slug', this.form.get('slug')?.value);
    formData.append('user_id', String(this.commonService.getUserId()));
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    } else if (this.isEditMode() && this.provider!.logo) {
      formData.append('logo', this.provider!.logo);
    }

    this.commonService.showSpinner();
    if (this.isEditMode()) {
      this.providerService.updateProvider(formData).subscribe({
        next: (res: BaseResponse<ProviderList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while updating provider');
        },
      });
    } else {
      this.providerService.createProvider(formData).subscribe({
        next: (res: BaseResponse<ProviderList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while creating provider');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
