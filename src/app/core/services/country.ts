import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { CountryList } from '../../model/country.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getCountries(payload?: any): Observable<BaseResponse<CountryList[]>> {
    return this.http.post<BaseResponse<CountryList[]>>(
      `${this.baseUrl}${API.country_api.get_country}`,
      payload || {},
    );
  }

  createCountry(payload: any): Observable<BaseResponse<CountryList>> {
    return this.http.post<BaseResponse<CountryList>>(
      `${this.baseUrl}${API.country_api.create_country}`,
      payload,
    );
  }

  getCountryById(id: number | string): Observable<BaseResponse<CountryList>> {
    return this.http.get<BaseResponse<CountryList>>(`${this.baseUrl}${API.country_api.get_country_by_id}/${id}`);
  }

  updateCountry(payload: any): Observable<BaseResponse<CountryList>> {
    return this.http.post<BaseResponse<CountryList>>(`${this.baseUrl}${API.country_api.update_country}`, payload);
  }

  deleteCountry(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.country_api.delete_country}`, payload);
  }

  updateCountryStatus(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.country_api.update_country_status}`, payload);
  }
}
