import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { GameList } from '../../model/game.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getGames(pagination?: any): Observable<BaseResponse<GameList[]>> {
    return this.http.post<BaseResponse<GameList[]>>(`${this.baseUrl}${API.games_api.get_games}`, pagination || {});
  }

  getGameById(id: number | string): Observable<BaseResponse<GameList>> {
    return this.http.get<BaseResponse<GameList>>(`${this.baseUrl}${API.games_api.get_game_by_id}/${id}`);
  }

  createGame(payload: FormData): Observable<BaseResponse<GameList>> {
    return this.http.post<BaseResponse<GameList>>(`${this.baseUrl}${API.games_api.create_game}`, payload);
  }

  updateGame(payload: FormData): Observable<BaseResponse<GameList>> {
    return this.http.post<BaseResponse<GameList>>(`${this.baseUrl}${API.games_api.update_game}`, payload);
  }

  deleteGame(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.games_api.delete_game}`, payload);
  }

  updateGameStatus(payload: any): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.games_api.update_game_status}`, payload);
  }
}
