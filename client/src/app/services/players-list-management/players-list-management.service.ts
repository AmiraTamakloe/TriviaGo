import { EventEmitter, Injectable } from '@angular/core';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class PlayersListManagementService {
    playersListChange = new EventEmitter<void>();
    playersPointsListChange = new EventEmitter<void>();
    playersOutListChange = new EventEmitter<string>();
    playerInteraction = new EventEmitter<{ playerName: string; step: number }>();
    resetColor = new EventEmitter<void>();

    protected pointsMap: Map<string, number> = new Map();
    protected players: string[] = [''];
    protected playersOut: string[] = [];
    protected allPlayersPoints: number[] = [];
    protected allPlayersBonus: number[] = [];
    protected allPlayersOutPoints: number[] = [];
    protected isAllGoodAnswerChecked: boolean = true;
    protected questionIndicator: number;
    private matchId: string;
    private listeners: string[] = [];

    constructor(
        public socketClientService: SocketClientService,
        private popupService: PopupService,
    ) {}

    get playersList(): string[] {
        return this.players;
    }

    get playersOutList(): string[] {
        return this.playersOut;
    }

    get playersPointsList(): number[] {
        return this.allPlayersPoints;
    }

    get playersBonusList(): number[] {
        return this.allPlayersBonus;
    }

    get playersOutPointsList(): number[] {
        return this.allPlayersOutPoints;
    }
    get playersMap(): Map<string, number> {
        return this.pointsMap;
    }
    get isAnswerGood(): boolean {
        return this.isAllGoodAnswerChecked;
    }

    get questionNumber(): number {
        return this.questionIndicator;
    }

    set questionNumber(points: number) {
        this.questionIndicator = points;
    }

    set playersPointsList(newPlayerPoint: number[]) {
        this.allPlayersPoints = newPlayerPoint;
    }

    set playersOutPointsList(newPlayerPoint: number[]) {
        this.allPlayersOutPoints = newPlayerPoint;
    }
    set playersBonusList(newPlayerBonus: number[]) {
        this.allPlayersBonus = newPlayerBonus;
    }
    private set isAnswerGood(isAllGood: boolean) {
        this.isAllGoodAnswerChecked = isAllGood;
    }

    init() {
        this.removeListeners();
        this.matchId = this.socketClientService.matchId;
        this.socketClientService.on('updatedPlayersList', (res: string[]) => {
            this.players = res;
            this.playersListChange.emit();
        });
        this.listeners.push('updatedPlayersList');

        this.socketClientService.on('updatedPlayersPoints', (points: number[]) => {
            this.playersPointsList = points;
            this.socketClientService.send('getPointsMap', this.matchId);
        });
        this.listeners.push('updatedPlayersPoints');

        this.socketClientService.on('updatedPlayersBonus', (bonus: number[]) => {
            this.playersBonusList = bonus;
        });
        this.listeners.push('updatedPlayersBonus');

        this.socketClientService.on('updatedPlayersOutList', (res: string) => {
            this.playersOut.push(res);
            this.playersOutListChange.emit(res);
        });
        this.listeners.push('updatedPlayersOutList');

        this.socketClientService.on('updatedPlayersOutPoints', (points: number) => {
            this.playersOutPointsList.push(points);
        });
        this.listeners.push('updatedPlayersOutPoints');

        this.socketClientService.on('bonusNotification', (res: boolean) => {
            if (res) {
                this.popupService.openPopup('Points bonus ajoutee', 0);
            }
        });
        this.listeners.push('bonusNotification');

        this.socketClientService.on('scoreCorrection', () => {
            this.scoreAttribution(this.isAnswerGood, this.questionNumber, true);
        });
        this.listeners.push('scoreCorrection');

        this.socketClientService.on('firstInteraction', (name: string) => {
            this.playerInteraction.emit({ playerName: name, step: 0 });
        });
        this.listeners.push('firstInteraction');

        this.socketClientService.on('enterClick', (name: string) => {
            this.playerInteraction.emit({ playerName: name, step: 1 });
        });
        this.listeners.push('enterClick');

        this.socketClientService.on('questionOver', () => {
            this.resetColor.emit();
        });
        this.socketClientService.on('getPointsMap', (pointsMap: Map<number, { name: string; points: number }>) => {
            pointsMap.forEach((value) => {
                this.pointsMap.set(value.name, value.points);
            });
            this.playersPointsListChange.emit();
        });
        this.listeners.push('getPointsMap');

        this.socketClientService.send('points', { point: 0, code: this.matchId });
        this.socketClientService.send('getPlayersList');
        this.socketClientService.send('getPlayersPoints', this.matchId);
        this.isAllGoodAnswerChecked = true;
    }

    async scoreAttribution(isAllGoodAnswerChecked: boolean, questionNumber: number, isScoreCorrected: boolean): Promise<void> {
        this.isAnswerGood = isAllGoodAnswerChecked;
        this.questionNumber = questionNumber;
        this.socketClientService.send('scoreAttribution', {
            answer: this.isAnswerGood,
            currentPoint: questionNumber,
            correction: isScoreCorrected,
        });
    }

    async wrongAnswer(isAllGoodAnswerChecked: boolean, questionNumber: number): Promise<void> {
        this.questionNumber = questionNumber;
        this.isAnswerGood = isAllGoodAnswerChecked;
        this.socketClientService.send('wrongAnswer', this.isAnswerGood);
    }

    closePopup(): void {
        this.popupService.closePopup();
    }

    endGame(): void {
        this.players = [''];
        this.playersOut = [];
        this.allPlayersPoints = [];
        this.allPlayersOutPoints = [];
        this.allPlayersBonus = [];
        this.removeListeners();
    }
    private removeListeners() {
        this.listeners.forEach((listener) => {
            this.socketClientService.removeAllListeners(listener);
        });
        this.listeners = [];
    }
}
