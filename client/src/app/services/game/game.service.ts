import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

import { catchError } from 'rxjs/operators';

@Injectable()
export class GameService {
    protected readonly baseURL = environment.serverUrl;

    constructor(private http: HttpClient) {}

    fetchAllGames(): Observable<Game[]> {
        return this.http.get<Game[]>(this.baseURL + '/game');
    }

    fetchVisibleGames(): Observable<Game[]> {
        return this.http.get<Game[]>(this.baseURL + '/game?isGameVisible=true');
    }
    patchGameVisibility(id: string): Observable<Game[]> {
        return this.http.patch<Game[]>(this.baseURL + `/createMatch/${id}/toggleVisibility`, {});
    }

    fetchGameById(id: string): Observable<Game> {
        return this.http.get<Game>(this.baseURL + `/game/${id}`).pipe(catchError(this.handleError<Game>('Game not found')));
    }

    removeGame(id: string) {
        return this.http.delete(`${this.baseURL}/createMatch/${id}`).subscribe();
    }
    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
