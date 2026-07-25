import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GameService } from '../../../core/services/game';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { GameList } from '../../../model/game.model';
import { ProviderList } from '../../../model/provider.model';
import { GameCategoryList } from '../../../model/game-category.model';
import { GameTypeList } from '../../../model/game-type.model';
import { DeviceTypeList } from '../../../model/device-type.model';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-edit-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,NgSelectModule],
  templateUrl: './add-edit-game.html',
  styleUrl: './add-edit-game.scss',
})
export class AddEditGame implements OnInit {
  @Input() game: GameList | null = null;
  @Input() providers: ProviderList[] = [];
  @Input() categories: GameCategoryList[] = [];
  @Input() gameTypes: GameTypeList[] = [];
  @Input() deviceTypes: DeviceTypeList[] = [];
  @Output() close = new EventEmitter<boolean>();

  form!: FormGroup;
  submitted = signal<boolean>(false);
  thumbnailPreview = signal<string | null>(null);
  selectedFile: File | null = null;
  isEditMode = signal<boolean>(false);

  private gameService = inject(GameService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.initForm();
    if (this.game) {
      this.isEditMode.set(true);
      this.form.patchValue({
        game_name: this.game.game_name,
        slug: this.game.slug || '',
        provider_id: this.game.provider_id,
        category_id: this.game.category_id,
        game_type_id: this.game.game_type_id || '',
        device_type_id: this.game.device_type_id || '',
        max_win: this.game.max_win || '',
        min_bet: this.game.min_bet || '',
        max_bet: this.game.max_bet || '',
        rtp: this.game.rtp || '',
        variance: this.game.variance || '',
      });

      if (this.game.release_date) {
        try {
          const d = new Date(this.game.release_date);
          const dateStr = d.toISOString().split('T')[0];
          this.form.get('release_date')?.setValue(dateStr);
        } catch (e) {
          // Fallback if date is invalid
        }
      }

      if (this.game.thumbnail) {
        this.thumbnailPreview.set(this.game.thumbnail);
      } else {
        this.thumbnailPreview.set(null);
      }
    } else {
      this.isEditMode.set(false);
      this.thumbnailPreview.set(null);
      this.selectedFile = null;
    }
  }

  initForm(): void {
    this.form = new FormGroup({
      game_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      slug: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
      provider_id: new FormControl('', [Validators.required]),
      category_id: new FormControl('', [Validators.required]),
      game_type_id: new FormControl('', [Validators.required]),
      device_type_id: new FormControl('', [Validators.required]),
      release_date: new FormControl(''),
      max_win: new FormControl('', [Validators.maxLength(100)]),
      min_bet: new FormControl('', [Validators.min(0)]),
      max_bet: new FormControl('', [Validators.min(0)]),
      rtp: new FormControl('', [Validators.min(0), Validators.max(100)]),
      variance: new FormControl(''),
      thumbnail: new FormControl(null)
    });
    this.submitted.set(false);
    this.selectedFile = null;

    // Auto-generate slug from name if not in edit mode
    this.form.get('game_name')?.valueChanges.subscribe(name => {
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

  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.thumbnailPreview.set(reader.result as string);
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
    formData.append('game_name', this.form.get('game_name')?.value);
    formData.append('slug', this.form.get('slug')?.value);
    formData.append('provider_id', this.form.get('provider_id')?.value);
    formData.append('category_id', this.form.get('category_id')?.value);
    formData.append('game_type_id', this.form.get('game_type_id')?.value);
    formData.append('device_type_id', this.form.get('device_type_id')?.value);
    
    const releaseDate = this.form.get('release_date')?.value;
    if (releaseDate) {
      formData.append('release_date', releaseDate);
    }
    
    const maxWin = this.form.get('max_win')?.value;
    if (maxWin) {
      formData.append('max_win', maxWin);
    }
    
    const minBet = this.form.get('min_bet')?.value;
    if (minBet) {
      formData.append('min_bet', minBet);
    }

    const maxBet = this.form.get('max_bet')?.value;
    if (maxBet) {
      formData.append('max_bet', maxBet);
    }

    const rtp = this.form.get('rtp')?.value;
    if (rtp) {
      formData.append('rtp', rtp);
    }

    const variance = this.form.get('variance')?.value;
    if (variance) {
      formData.append('variance', variance);
    }

    if (this.selectedFile) {
      formData.append('thumbnail', this.selectedFile);
    } else if (this.isEditMode() && this.game!.thumbnail) {
      formData.append('thumbnail', this.game!.thumbnail);
    }

    formData.append('user_id', String(this.commonService.getUserId()));
    if (this.isEditMode()) {
      formData.append('game_id', String(this.game!.game_id));
    }

    this.commonService.showSpinner();
    if (this.isEditMode()) {
      this.gameService.updateGame(formData).subscribe({
        next: (res: BaseResponse<GameList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while updating game');
        },
      });
    } else {
      this.gameService.createGame(formData).subscribe({
        next: (res: BaseResponse<GameList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while creating game');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
