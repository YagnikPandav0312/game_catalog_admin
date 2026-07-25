import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { ProviderList } from '../../model/provider.model';
import { BaseResponse, getPayloadReq } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getProviders(payload?: getPayloadReq): Observable<BaseResponse<ProviderList[]>> {
    return this.http.post<BaseResponse<ProviderList[]>>(
      `${this.baseUrl}${API.providers_api.get_providers}`,
      payload || {},
    );
  }

  getProviderById(id: number | string, user_id: number): Observable<BaseResponse<ProviderList>> {
    return this.http.post<BaseResponse<ProviderList>>(`${this.baseUrl}${API.providers_api.get_provider_by_id}`, {
      provider_id: id,
      user_id: user_id
    });
  }

  createProvider(formData: FormData): Observable<BaseResponse<ProviderList>> {
    return this.http.post<BaseResponse<ProviderList>>(`${this.baseUrl}${API.providers_api.create_providers}`, formData);
  }

  updateProvider(formData: FormData): Observable<BaseResponse<ProviderList>> {
    return this.http.post<BaseResponse<ProviderList>>(`${this.baseUrl}${API.providers_api.update_providers}`, formData);
  }

  deleteProvider(paylaod: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.providers_api.delete_provider}`, paylaod);
  }

  updateProviderStatus(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.providers_api.update_provider_status}`, payload);
  }

  getProviderDdl(payload?: any): Observable<BaseResponse<ProviderList[]>> {
    return this.http.post<BaseResponse<ProviderList[]>>(`${this.baseUrl}${API.providers_api.get_provider_ddl}`, payload || {});
  }
}
