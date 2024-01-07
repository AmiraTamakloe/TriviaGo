/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class FormValidationService {
    readonly baseURL = environment.serverUrl;

    private date: Date = new Date();
    constructor(private http: HttpClient) {}

    postGame(game: any) {
        game.lastModification = this.date.toISOString();
        game.duration = +game.duration;
        game.questions.forEach((element: any) => {
            element.points = +element.points;
            if (element.type === 'QRL') {
                delete element.choices;
            } else {
                element.choices.forEach((choice: any) => {
                    choice.isCorrect = JSON.parse(choice.isCorrect);
                });
            }
        });
        return this.http.post(this.baseURL + '/createMatch', game);
    }

    patchGame(game: any, id: string) {
        game.lastModification = this.date.toISOString();
        game.duration = +game.duration;
        game.questions.forEach((element: any) => {
            element.points = +element.points;
            if (element.type === 'QRL') {
                delete element.choices;
            } else {
                element.choices.forEach((choice: any) => {
                    choice.isCorrect = JSON.parse(choice.isCorrect);
                });
            }
        });
        return this.http.patch(this.baseURL + '/createMatch/' + id, game);
    }

    uploadGame(game: any) {
        const params = new HttpParams().set('isJson', 'true');
        return this.http.post(this.baseURL + '/createMatch', game, { params });
    }
}
