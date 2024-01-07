import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import PlayAudioService from '@app/services/play-audio/play-audio.service';
import { PopupService } from '@app/services/popup/popup.service';
import { QrlCommonService } from '@app/services/qrl-common/qrl-common.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimerService } from '@app/services/timer/timer.service';
import { ANIMATION_DURATION } from '@common/constants';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchQuestionManagementService {
    readonly questionDone = new EventEmitter<void>();
    readonly nextQuestion = new EventEmitter<boolean>(true);
    readonly answerResult = new EventEmitter<boolean>(false);
    readonly updateChart = new EventEmitter<{ player: string; answer: number[] }>();
    readonly timeIsUp = new EventEmitter<void>();
    readonly qrlAnswered = new EventEmitter<void>();
    readonly resetTimerControls = new EventEmitter<void>();
    matchId: string;
    nextButtonVisible: boolean = false;
    timerControlsEnabled: boolean = true;
    protected isEndButtonClicked: boolean = false;
    protected validateDisabled: boolean = false;
    private isEveryPlayerDone = new BehaviorSubject<boolean>(false);
    private audioService: PlayAudioService = new PlayAudioService();
    private questionNumberValue: number = 0;
    private isResultsValue: boolean = false;
    private game: Game;
    private questionTypeValue: string;
    private listeners: string[] = [];

    // eslint-disable-next-line max-params
    constructor(
        public socketClientService: SocketClientService,
        readonly timer: TimerService,
        private router: Router,
        private popupService: PopupService,
        private qrlCommonService: QrlCommonService,
    ) {}

    get time(): string {
        return this.timer.remainingTime;
    }
    get isResults(): boolean {
        return this.isResultsValue;
    }
    get questionType(): string {
        return this.questionTypeValue;
    }
    get questionNumber(): number {
        return this.questionNumberValue;
    }

    init() {
        this.removeListeners();

        this.matchId = this.socketClientService.matchId;
        this.socketClientService.on('questionAnswered', (value: boolean) => {
            this.timerControlsEnabled = false;
            this.setIsEveryPlayerDone(value);
            this.questionDone.emit();
            this.setNextButtonVisible();
        });
        this.listeners.push('questionAnswered');

        this.socketClientService.on('questionOver', (value: boolean) => {
            if (this.questionNumberValue === this.game.questions.length - 1) {
                this.isResultsValue = true;
            }
            this.displayQuestionNextPopup(value);
        });
        this.listeners.push('questionOver');

        this.socketClientService.on('timeIsUp', () => {
            this.setNextButtonVisible();
            this.timerControlsEnabled = false;
            this.timeIsUp.emit();
            this.audioService.pauseAudio();
        });
        this.listeners.push('timeIsUp');

        this.socketClientService.on('playerAnswerIndex', (res: { player: string; answer: number[] }) => {
            this.updateChart.emit(res);
        });
        this.socketClientService.on('panic', (enable: boolean) => {
            if (enable) {
                this.audioService.loopAudio();
            } else {
                this.audioService.pauseAudio();
            }
        });
        this.listeners.push('playerAnswerIndex');
    }

    getIsEveryPlayerDone(): Observable<boolean> {
        return this.isEveryPlayerDone.asObservable();
    }

    setIsEveryPlayerDone(mode: boolean) {
        this.isEveryPlayerDone.next(mode);
    }

    async matchOver(): Promise<void> {
        this.socketClientService.send('exitMatch', async () => {
            this.socketClientService.send('reinitializeSocketListeners');
        });
        await this.router.navigate(['/home']);
    }

    timeAnswered() {
        this.socketClientService.send('questionAnswered', Number(this.time));
    }

    questionOver() {
        this.socketClientService.send('questionOver', this.matchId);
    }

    qcmResult(isQuestionAnswered: boolean) {
        this.answerResult.emit(isQuestionAnswered);
        this.socketClientService.send('stopTimer');
    }

    startTimer() {
        this.timer.start(this.questionTypeValue);
        this.timerControlsEnabled = true;
        this.resetTimerControls.emit();
    }
    stopTimer() {
        this.timer.stop();
    }
    isQcm(): boolean {
        return this.questionTypeValue === 'QCM';
    }
    newMatch(game: Game) {
        this.game = game;
        this.questionNumberValue = 0;
        this.questionTypeValue = this.game.questions[this.questionNumberValue].type;
        this.isResultsValue = false;
    }
    incrementQuestion() {
        this.questionNumberValue++;
        this.questionTypeValue = this.game.questions[this.questionNumberValue].type;
        if (!this.isQcm()) {
            this.qrlCommonService.newQrl();
        }
    }
    setNextButtonVisible() {
        this.nextButtonVisible = true;
        if (this.questionNumberValue === this.game.questions.length - 1) {
            this.isResultsValue = true;
        }
    }

    playerAnswerIndex(answerIndex: number[]) {
        this.socketClientService.send('playerAnswerIndex', answerIndex);
    }

    firstInteraction() {
        this.socketClientService.send('firstInteraction');
    }

    enterClick() {
        this.socketClientService.send('enterClick');
    }

    endGame(): void {
        this.removeListeners();
        this.socketClientService.removeAllListeners('questionTimer');
        this.socketClientService.removeAllListeners('stopTimer');
        this.socketClientService.removeAllListeners('exitMatch');
    }

    displayQuestionNextPopup(value: boolean) {
        this.intervalPopup(value, ANIMATION_DURATION);
    }

    private intervalPopup(value: boolean, intervalMs: number) {
        let count = 3;
        const interval = setInterval(() => {
            if (count > 0) {
                this.popupService.openPopup(`Question suivante dans ${count} secondes`, 0);
            } else {
                this.popupService.closePopup();
                clearInterval(interval);
                this.setIsEveryPlayerDone(value);
                this.nextQuestion.emit(true);
                this.nextButtonVisible = false;
                this.incrementQuestion();

                this.startTimer();
            }
            count--;
        }, intervalMs);
    }
    private removeListeners() {
        this.listeners.forEach((listener) => {
            this.socketClientService.removeAllListeners(listener);
        });
        this.listeners = [];
    }
}
