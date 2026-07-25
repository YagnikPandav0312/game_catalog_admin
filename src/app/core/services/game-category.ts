import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { GameCategoryList } from '../../model/game-category.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class GameCategoryService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getGameCategories(pagination?: any): Observable<BaseResponse<GameCategoryList[]>> {
    return this.http.post<BaseResponse<GameCategoryList[]>>(`${this.baseUrl}${API.game_category_api.get_game_category}`, pagination || {});
  }

  getGameCategoryById(id: number | string): Observable<BaseResponse<GameCategoryList>> {
    return this.http.get<BaseResponse<GameCategoryList>>(`${this.baseUrl}${API.game_category_api.get_game_category_by_id}/${id}`);
  }

  createGameCategory(payload: { game_categorie_name: string; slug: string }): Observable<BaseResponse<GameCategoryList>> {
    return this.http.post<BaseResponse<GameCategoryList>>(`${this.baseUrl}${API.game_category_api.create_game_category}`, payload);
  }

  updateGameCategory(payload: any): Observable<BaseResponse<GameCategoryList>> {
    return this.http.post<BaseResponse<GameCategoryList>>(`${this.baseUrl}${API.game_category_api.update_game_category}`, payload);
  }

  deleteGameCategory(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.game_category_api.delete_game_category}`, payload);
  }

  updateGameCategoryStatus(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.game_category_api.update_game_category_status}`, payload);
  }

  getGameCategoryDdl(payload: any): Observable<BaseResponse<GameCategoryList[]>> {
    return this.http.post<BaseResponse<GameCategoryList[]>>(`${this.baseUrl}${API.game_category_api.get_game_category_ddl}`, payload || {});
  }
}
