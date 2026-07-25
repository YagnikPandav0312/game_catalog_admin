import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Common } from '../../core/services/common';


@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {

  fullName = signal<string>('');
  public commonService = inject(Common);
  avatarLetter = computed(() => {
    const name = this.fullName();
    return name ? name.charAt(0).toUpperCase() : '';
  });

  ngOnInit(): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.full_name) {
          this.fullName.set(user.full_name);
        }
      }
    } catch (e) {
      console.error('Failed to parse user details in header', e);
    }
  }
}
