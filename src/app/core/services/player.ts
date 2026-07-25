import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { PlayerList } from '../../model/player.model';
import { BaseResponse } from '../../model/api.model';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getPlayers(pagination?: any): Observable<BaseResponse<PlayerList[]>> {
    return this.http.post<BaseResponse<PlayerList[]>>(`${this.baseUrl}${API.player_api.get_players}`, pagination || {});
  }

  getPlayerById(id: number | string): Observable<BaseResponse<PlayerList>> {
    return this.http.get<BaseResponse<PlayerList>>(`${this.baseUrl}${API.player_api.get_player_by_id}/${id}`);
  }

  createPlayer(payload: { full_name: string; email: string; password?: string; user_id?: number }): Observable<BaseResponse<PlayerList>> {
    return this.http.post<BaseResponse<PlayerList>>(`${this.baseUrl}${API.player_api.create_player}`, payload);
  }

  updatePlayer(payload: { id: number | string; full_name: string; email: string; user_id?: number }): Observable<BaseResponse<PlayerList>> {
    return this.http.post<BaseResponse<PlayerList>>(`${this.baseUrl}${API.player_api.update_player}`, payload);
  }

  deletePlayer(payload: { id: number | string; user_id?: number }): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.player_api.delete_player}`, payload);
  }

  updatePlayerStatus(payload: { id: number | string; status: boolean; user_id?: number }): Observable<BaseResponse<any>> {
    return this.http.post<BaseResponse<any>>(`${this.baseUrl}${API.player_api.update_player_status}`, payload);
  }
}
