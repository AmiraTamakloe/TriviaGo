import { Injectable } from '@angular/core';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
@Injectable({
    providedIn: 'root',
})
export class QrlHostService {
    private answersValue: { player: string; answer: string }[] = [];
    private resultsValue: { player: string; note: number }[] = [];
    private evalIndexValue = 0;
    private nPlayersValue = 0;
    private nRecentChangesValue = 0;

    constructor(
        private socket: SocketClientService,
        private matchQuestionManagementService: MatchQuestionManagementService,
        private histogramInfoService: HistogramInfoService,
    ) {
        this.socket.on('qrlRecentChanges', (data: { nRecentChanges: number; nPlayers: number }) => {
            this.nRecentChangesValue = data.nRecentChanges;
            this.nPlayersValue = data.nPlayers;
        });
        this.socket.on('qrlAnswers', (answers: { player: string; answer: string }[]) => {
            this.evalIndexValue = 0;
            this.answersValue = answers;
            this.resultsValue = [];
            this.matchQuestionManagementService.timerControlsEnabled = false;
        });
    }
    get nRecentChanges() {
        return this.nRecentChangesValue;
    }
    get nPlayers() {
        return this.nPlayersValue;
    }
    get evalIndex() {
        return this.evalIndexValue;
    }
    get answers() {
        return this.answersValue;
    }
    get results() {
        return this.resultsValue;
    }
    submitEval(note: number) {
        this.histogramInfoService.updateQrlValue(note);
        this.resultsValue.push({
            player: this.answers[this.evalIndex].player,
            note,
        });
        this.evalIndexValue++;
        if (this.evalIndex >= this.answers.length) {
            this.matchQuestionManagementService.setNextButtonVisible();
            this.socket.send('qrlExaminationDone', { results: this.results, questionNumber: this.matchQuestionManagementService.questionNumber });
        }
    }
}
