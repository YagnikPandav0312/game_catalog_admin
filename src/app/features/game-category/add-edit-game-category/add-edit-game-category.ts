import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameCategoryService } from '../../../core/services/game-category';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { GameCategoryList } from '../../../model/game-category.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { GameTypeList } from '../../../model/game-type.model';

@Component({
  selector: 'app-add-edit-game-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './add-edit-game-category.html',
  styleUrl: './add-edit-game-category.scss',
})
export class AddEditGameCategory implements OnInit {
  @Input() gameCategory: GameCategoryList | null = null;
  @Output() close = new EventEmitter<boolean>();
  form!: FormGroup;
  submitted = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  @Input() gameTypes: GameTypeList[] = [];
  private gameCategoryService = inject(GameCategoryService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.gameCategory) {
      console.log(this.gameCategory);
      this.isEditMode.set(true);
      this.form.patchValue({
        game_categorie_name: this.gameCategory.game_categorie_name,
        slug: this.gameCategory.slug || '',
        game_type_id: this.gameCategory.game_type_id,
      });
    } else {
      this.isEditMode.set(false);
    }
  }

  initForm(): void {
    this.form = new FormGroup({
      game_categorie_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      slug: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
      game_type_id: new FormControl('', [Validators.required]),
    });
    this.submitted.set(false);

    // Auto-generate slug from name if not in edit mode
    this.form.get('game_categorie_name')?.valueChanges.subscribe(name => {
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
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start
      .replace(/-+$/, '');            // Trim - from end
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
      game_categorie_name: this.form.get('game_categorie_name')?.value,
      slug: this.form.get('slug')?.value,
      user_id: this.commonService.getUserId() || 0,
      game_type_id: this.form.get('game_type_id')?.value,
    };

    this.commonService.showSpinner();
    if (this.isEditMode()) {
      payload.game_categorie_id = this.gameCategory!.game_categorie_id;
      this.gameCategoryService.updateGameCategory(payload).subscribe({
        next: (res: BaseResponse<GameCategoryList>) => {
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
          this.toastr.error(err.error?.status?.message || err.error?.message || 'An error occurred while updating game category');
        },
      });
    } else {
      this.gameCategoryService.createGameCategory(payload).subscribe({
        next: (res: BaseResponse<GameCategoryList>) => {
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
          this.toastr.error(err.error?.status?.message || err.error?.message || 'An error occurred while creating game category');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
