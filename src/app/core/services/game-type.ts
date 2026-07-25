import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { GameTypeList } from '../../model/game-type.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class GameTypeService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getGameTypes(pagination?: any): Observable<BaseResponse<GameTypeList[]>> {
    return this.http.post<BaseResponse<GameTypeList[]>>(`${this.baseUrl}${API.game_type_api.get_game_type}`, pagination || {});
  }

  getGameTypeById(id: number | string): Observable<BaseResponse<GameTypeList>> {
    return this.http.get<BaseResponse<GameTypeList>>(`${this.baseUrl}${API.game_type_api.get_game_type_by_id}/${id}`);
  }

  createGameType(payload: { game_types_name: string; slug: string }): Observable<BaseResponse<GameTypeList>> {
    return this.http.post<BaseResponse<GameTypeList>>(`${this.baseUrl}${API.game_type_api.create_game_type}`, payload);
  }

  updateGameType(payload: any): Observable<BaseResponse<GameTypeList>> {
    return this.http.post<BaseResponse<GameTypeList>>(`${this.baseUrl}${API.game_type_api.update_game_type}`, payload);
  }

  deleteGameType(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.game_type_api.delete_game_type}`, payload);
  }

  updateGameTypeStatus(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.game_type_api.update_game_type_status}`, payload);
  }

  getGameTypeDdl(payload?: any): Observable<BaseResponse<GameTypeList[]>> {
    return this.http.post<BaseResponse<GameTypeList[]>>(`${this.baseUrl}${API.game_type_api.get_game_type_ddl}`, payload || {});
  } 
}
