import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { History } from '@app/interfaces/history';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GameHistoryService {
    protected readonly baseURL = environment.serverUrl;

    constructor(private http: HttpClient) {}

    fetchGameHistory(): Observable<History[]> {
        return this.http.get<History[]>(this.baseURL + '/history');
    }

    removeGameHistory() {
        return this.http.delete(this.baseURL + '/history').subscribe();
    }

    postGameHistory(history: History): Observable<History> {
        return this.http.post<History>(this.baseURL + '/history', history);
    }
}
