import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginRequest, RegisterRequest } from '../../model/auth.model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class Auth {

  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  constructor() { }

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  logout(user_id: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, { user_id });
  }
}
