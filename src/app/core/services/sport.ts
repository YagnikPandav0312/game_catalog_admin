import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { SportList } from '../../model/sport.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class SportService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getSports(payload?: any): Observable<BaseResponse<SportList[]>> {
    return this.http.post<BaseResponse<SportList[]>>(
      `${this.baseUrl}${API.sport_api.get_sport}`,
      payload || {},
    );
  }

  getSportById(id: number | string): Observable<BaseResponse<SportList>> {
    return this.http.get<BaseResponse<SportList>>(`${this.baseUrl}${API.sport_api.get_sport_by_id}/${id}`);
  }

  createSport(formData: FormData): Observable<BaseResponse<SportList>> {
    return this.http.post<BaseResponse<SportList>>(`${this.baseUrl}${API.sport_api.create_sport}`, formData);
  }

  updateSport(formData: FormData): Observable<BaseResponse<SportList>> {
    return this.http.post<BaseResponse<SportList>>(`${this.baseUrl}${API.sport_api.update_sport}`, formData);
  }

  deleteSport(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.sport_api.delete_sport}`, payload);
  }

  updateSportStatus(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.sport_api.update_sport_status}`, payload);
  }
}
