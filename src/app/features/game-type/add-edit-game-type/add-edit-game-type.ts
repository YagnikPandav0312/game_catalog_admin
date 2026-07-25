import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameTypeService } from '../../../core/services/game-type';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { GameTypeList } from '../../../model/game-type.model';

@Component({
  selector: 'app-add-edit-gametype',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-game-type.html',
  styleUrl: './add-edit-game-type.scss',
})
export class AddEditGametype implements OnInit {
  @Input() gameType: GameTypeList | null = null;
  @Output() close = new EventEmitter<boolean>();
  form!: FormGroup;
  submitted = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  private gameTypeService = inject(GameTypeService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.gameType) {
      this.isEditMode.set(true);
      this.form.patchValue({
        game_types_name: this.gameType.game_type_name,
        slug: this.gameType.slug || '',
      });
    } else {
      this.isEditMode.set(false);
    }
  }

  initForm(): void {
    this.form = new FormGroup({
      game_types_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      slug: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
    });
    this.submitted.set(false);

    this.form.get('game_types_name')?.valueChanges.subscribe((name) => {
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
      game_types_name: this.form.get('game_types_name')?.value,
      slug: this.form.get('slug')?.value,
      user_id: this.commonService.getUserId() || 0,
    };

    this.commonService.showSpinner();
    if (this.isEditMode()) {
      payload.game_type_id = this.gameType!.game_type_id;
      this.gameTypeService.updateGameType(payload).subscribe({
        next: (res: BaseResponse<GameTypeList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while updating game type');
        },
      });
    } else {
      this.gameTypeService.createGameType(payload).subscribe({
        next: (res: BaseResponse<GameTypeList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while creating game type');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
