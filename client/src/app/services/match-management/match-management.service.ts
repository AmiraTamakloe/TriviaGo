/* eslint-disable max-params */
import { EventEmitter, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { History } from '@app/interfaces/history';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameModeSelectionService } from '@app/services/game-mode-selection/game-mode-selection.service';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { POPUP_DURATION } from '@common/constants';
import { Result } from '@common/results';
import { Subject } from 'rxjs';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';

@Injectable({
    providedIn: 'root',
})
export class MatchManagementService {
    displayFinalResults = new Subject<void>();
    matchId: string;
    time: string;
    organizer: boolean;
    closePopup = new EventEmitter<void>();
    finalResults: Result[] = [];
    protected playerAnswered: number = 0;
    protected isEndButtonClicked: boolean = false;
    private listeners: string[] = [];
    private gameId: string;

    constructor(
        public socketClientService: SocketClientService,
        private router: Router,
        private gameModeSelectionService: GameModeSelectionService,
        private popupService: PopupService,
        private route: ActivatedRoute,
        private gameHistoryService: GameHistoryService,
        private matchQuestionManagementService: MatchQuestionManagementService,
    ) {
        this.route.queryParams.subscribe((params) => {
            this.organizer = params.organizer === 'true';
        });
    }

    private set remainingTime(time: number) {
        this.time = time.toFixed(1);
    }

    init() {
        this.removeListeners();
        this.matchId = this.socketClientService.matchId;
        this.socketClientService.on('successfulJoin', async (data: { matchId: string; gameId: string }) => {
            this.gameId = data.gameId;
            this.onSuccessfulJoin(data.matchId);
        });
        this.listeners.push('successfulJoin');

        this.socketClientService.on('displayFinalResults', (finalResults: Result[]) => {
            this.finalResults = finalResults;
            this.displayFinalResults.next();
        });
        this.listeners.push('displayFinalResults');

        this.socketClientService.on('gameHistory', (gameHistory: History) => {
            this.gameHistoryService.postGameHistory(gameHistory).subscribe();
        });
        this.listeners.push('gameHistory');

        this.socketClientService.on('wrongMatchId', () => {
            this.popupService.openPopup('Le code entré est invalide', POPUP_DURATION);
        });
        this.listeners.push('wrongMatchId');

        this.socketClientService.on('wrongUserName', () => {
            this.popupService.openPopup('Le nom de joueur entré est invalide', POPUP_DURATION);
        });
        this.listeners.push('wrongUserName');

        this.socketClientService.on('matchStarted', (res: { matchId: string }) => {
            this.gameModeSelectionService.setSelectedMode('multi');
            this.router.navigate(['games/create/' + res.matchId]);
        });
        this.listeners.push('matchStarted');

        this.socketClientService.on<number>('questionTimer', (remainingTime) => {
            this.remainingTime = remainingTime;
        });
        this.listeners.push('questionTimer');

        this.socketClientService.on('backToHomePage', async () => {
            await this.router.navigate(['/home']);
        });
        this.listeners.push('backToHomePage');

        this.socketClientService.on('matchCanceled', () => {
            this.router.navigate(['/home']);
            this.popupService.openPopup('La partie a été annulée.', POPUP_DURATION);
        });
        this.listeners.push('matchCanceled');

        this.socketClientService.on('playerBanned', () => {
            this.router.navigate(['/home']);
            this.popupService.openPopup('Vous avez été bannis.', POPUP_DURATION);
        });
        this.listeners.push('playerBanned');

        this.socketClientService.on('matchLocked', () => {
            this.popupService.openPopup("La partie n'accepte pas de nouveaux joueurs", POPUP_DURATION);
        });
        this.listeners.push('matchLocked');

        this.socketClientService.on('gameNotFound', () => {
            this.router.navigate(['/home']);
            this.popupService.openPopup("Le jeu n'est plus disponible. La partie a été annulée.", POPUP_DURATION);
        });
        this.listeners.push('gameNotFound');
    }

    startMatch() {
        this.router.navigate(['games/create/' + this.gameId], {
            queryParams: { organizer: this.organizer },
        });
        this.gameModeSelectionService.setSelectedMode('multi');
    }

    createMatch(gameId: string): void {
        this.gameId = gameId;
        this.socketClientService.send('createMatch', gameId, async (res: { matchId: string }) => {
            this.socketClientService.matchId = res.matchId;
            await this.router.navigate(['games/waiting/' + gameId], { queryParams: { organizer: true } });
        });
    }

    createTestMatch(gameId: string): void {
        this.gameId = gameId;
        this.gameModeSelectionService.setSelectedMode('solo');
        this.socketClientService.send('createMatch', gameId, async (res: { matchId: string }) => {
            this.socketClientService.matchId = res.matchId;
            await this.router.navigate(['games/test/' + gameId]);
        });
    }

    async onSuccessfulJoin(matchId: string) {
        this.socketClientService.matchId = matchId;
        await this.router.navigate(['games/waiting/' + matchId], { queryParams: { organizer: false } });
    }

    lockState(isLocked: boolean) {
        this.socketClientService.send('changeLockState', isLocked);
    }

    getIsOrganizer(): boolean {
        return this.organizer;
    }

    finalResult(): void {
        this.socketClientService.send('finalResultsForAll');
    }

    async exitMatch(): Promise<void> {
        this.matchQuestionManagementService.matchOver();
    }
    endGame(): void {
        this.removeListeners();
    }
    private removeListeners() {
        this.listeners.forEach((listener) => {
            this.socketClientService.removeAllListeners(listener);
        });
        this.listeners = [];
    }
}
