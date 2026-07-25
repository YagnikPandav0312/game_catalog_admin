import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PlayerService } from '../../../core/services/player';
import { Common } from '../../../core/services/common';
import { ToastrService } from 'ngx-toastr';
import { BaseResponse } from '../../../model/api.model';
import { PlayerList } from '../../../model/player.model';

@Component({
  selector: 'app-add-edit-player',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-player.html',
  styleUrl: './add-edit-player.scss',
})
export class AddEditPlayer implements OnInit {
  @Input() player: any = null;
  @Output() close = new EventEmitter<boolean>();
  form!: FormGroup;
  submitted = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  private playerService = inject(PlayerService);
  private commonService = inject(Common);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.isEditMode.set(!!this.player);
    this.initForm();
    if (this.player) {
      this.form.patchValue({
        full_name: this.player.full_name,
        email: this.player.email || '',
      });
    }
  }

  initForm(): void {
    this.form = new FormGroup({
      full_name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(255)]),
      password: new FormControl('', this.isEditMode() ? [] : [Validators.required, Validators.minLength(6), Validators.maxLength(50)]),
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
      full_name: this.form.get('full_name')?.value?.trim(),
      email: this.form.get('email')?.value?.trim(),
      user_id: this.commonService.getUserId() || 0,
    };

    if (this.isEditMode()) {
      payload.id = this.player.player_id;
      this.commonService.showSpinner();
      this.playerService.updatePlayer(payload).subscribe({
        next: (res: BaseResponse<PlayerList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while updating player');
        },
      });
    } else {
      payload.password = this.form.get('password')?.value;
      this.commonService.showSpinner();
      this.playerService.createPlayer(payload).subscribe({
        next: (res: BaseResponse<PlayerList>) => {
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
          this.toastr.error(err.error?.status?.message || 'An error occurred while creating player');
        },
      });
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }
}
