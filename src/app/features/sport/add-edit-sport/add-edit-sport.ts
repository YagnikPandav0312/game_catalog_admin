import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SportService } from '../../../core/services/sport';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { SportList } from '../../../model/sport.model';

@Component({
  selector: 'app-add-edit-sport',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-sport.html',
  styleUrl: './add-edit-sport.scss',
})
export class AddEditSport implements OnInit {
  @Input() sport: SportList | null = null;
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;
  submitted = signal<boolean>(false);
  logoPreview = signal<string | null>(null);
  selectedFile: File | null = null;
  isEditMode = signal<boolean>(false);

  private sportService = inject(SportService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.sport) {
      this.isEditMode.set(true);
      this.form.patchValue({
        sport_id: this.sport.sport_id,
        sport_name: this.sport.sport_name,
        slug: this.sport.slug || '',
        user_id: String(this.commonService.getUserId()),
      });
      if (this.sport.logo) {
        if (this.sport.logo.startsWith('http') || this.sport.logo.startsWith('data:')) {
          this.logoPreview.set(this.sport.logo);
        } else {
          this.logoPreview.set(`${this.sport.logo}`);
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
      sport_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      slug: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
      logo: new FormControl(null),
    });
    this.submitted.set(false);
    this.selectedFile = null;

    // Auto-generate slug from name if not in edit mode
    this.form.get('sport_name')?.valueChanges.subscribe((name) => {
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
      formData.append('sport_id', String(this.sport?.sport_id));
    }
    formData.append('sport_name', this.form.get('sport_name')?.value);
    formData.append('slug', this.form.get('slug')?.value);
    formData.append('user_id', String(this.commonService.getUserId()));
    if (this.selectedFile) {
      formData.append('logo', this.selectedFile);
    } else if (this.isEditMode() && this.sport!.logo) {
      formData.append('logo', this.sport!.logo);
    }

    this.commonService.showSpinner();
    if (this.isEditMode()) {
      this.sportService.updateSport(formData).subscribe({
        next: (res: BaseResponse<SportList>) => {
          this.commonService.hideSpinner();
          if (res && res.status.code === 0) {
            this.commonService.manageStatus(res.status);
            this.close.emit(true);
          } else {
            this.commonService.manageStatus(res.status);
          }
        },
        error: (err) => {
          this.commonService.hideSpinner();
          this.toastr.error(err.error?.status?.message || 'An error occurred while updating sport');
        },
      });
    } else {
      this.sportService.createSport(formData).subscribe({
        next: (res: BaseResponse<SportList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while creating sport');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
