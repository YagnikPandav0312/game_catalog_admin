import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { DashboardStatistics } from '../../model/dashboard.model';
import { BaseResponse, getPayloadReq } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getStatistics(payload?: getPayloadReq): Observable<BaseResponse<DashboardStatistics>> {
    return this.http.post<BaseResponse<DashboardStatistics>>(
      `${this.baseUrl}${API.dashboard_api.get_statistics}`,
      payload,
    );
  }
}
