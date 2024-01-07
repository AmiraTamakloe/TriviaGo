/* eslint-disable max-params */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CheckBox } from '@app/interfaces/check-box';
import { Game } from '@app/interfaces/game';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { PlayersListManagementService } from '@app/services/players-list-management/players-list-management.service';
import { TimeService } from '@app/services/time/time.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-play-area-multiplayer',
    templateUrl: './play-area-multiplayer.component.html',
    styleUrls: ['./play-area-multiplayer.component.scss'],
})
export class PlayAreaMultiplayerComponent implements OnInit, OnDestroy {
    protected isGameOver = false;
    protected questionNumber: number = 0;
    protected isEndButtonClicked: boolean = false;
    protected playerAnswered: number = 0;
    protected whiteIshColor: string = '#d9e5d6';
    protected blueIshColor: string = '#0fa3b1';
    protected items: CheckBox[];
    protected organizer: boolean;
    private game: Game;
    private isAllGoodAnswerChecked: boolean = true;
    private subscriptions: Subscription[] = [];

    constructor(
        private playersListManagementService: PlayersListManagementService,
        readonly matchQuestionManagementService: MatchQuestionManagementService,
        private matchManagementService: MatchManagementService,
        private route: ActivatedRoute,
        private histogramInfoService: HistogramInfoService,
        private timeService: TimeService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.setOrganizer();
        this.matchQuestionManagementService.init();
        this.playersListManagementService.init();
        this.subscriptions.push(
            this.matchQuestionManagementService.questionDone.subscribe(() => {
                if (this.matchQuestionManagementService.isQcm()) {
                    this.scoreAttribution();
                    this.qcmResult();
                }
            }),
            this.matchQuestionManagementService.timeIsUp.subscribe(async () => {
                if (this.matchQuestionManagementService.isQcm()) {
                    if (this.items === undefined) {
                        this.isAllGoodAnswerChecked = false;
                        await this.playersListManagementService.scoreAttribution(this.isAllGoodAnswerChecked, this.questionNumber, false);
                        this.qcmResult();
                    } else {
                        this.matchQuestionManagementService.playerAnswerIndex(this.getAnswerIndex(this.items));
                        this.timerEnded();
                    }
                }
            }),
            this.matchManagementService.displayFinalResults.subscribe(() => {
                this.isGameOver = true;
            }),
            this.matchQuestionManagementService.nextQuestion.subscribe(() => {
                this.nextQuestion();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => {
            if (!subscription.closed) {
                subscription.unsubscribe();
            }
        });
        this.playersListManagementService.endGame();
        this.matchQuestionManagementService.endGame();
        this.matchManagementService.endGame();
    }

    setOrganizer() {
        this.route.queryParams.subscribe((params) => {
            this.organizer = params.organizer === 'true';
        });
    }

    checkBoxValidation(item: CheckBox[]) {
        this.matchQuestionManagementService.playerAnswerIndex(this.getAnswerIndex(item));
        this.matchQuestionManagementService.timeAnswered();
        this.subscriptions.push(
            this.matchQuestionManagementService.getIsEveryPlayerDone().subscribe((mode) => {
                if (mode) {
                    this.items = item;
                    this.isEndButtonClicked = true;
                }
            }),
        );
    }

    checkBoxInformation(item: CheckBox[]) {
        this.items = item;
    }

    dataBaseInfo(info: Game) {
        this.game = info;
    }

    getAnswerIndex(items: CheckBox[]): number[] {
        const indexArray = [];
        for (let index = 0; index < items.length; index++) {
            if (items[index].isBoxChecked) {
                indexArray.push(index);
            }
        }
        return indexArray;
    }

    timerEnded(): void {
        this.scoreAttribution();
        this.qcmResult();
    }

    qcmResult(): void {
        this.matchQuestionManagementService.qcmResult(true);
    }

    nextQuestion(): void {
        this.playersListManagementService.closePopup();
        this.questionNumber += 1;
        this.isEndButtonClicked = false;
    }

    async displayResults() {
        if (this.matchManagementService.organizer) {
            await this.histogramInfoService.addBarsForLastQuestion(this.matchQuestionManagementService.isQcm());
        }
    }

    endingQuiz() {
        this.timeService.stopTimer();
        this.matchManagementService.exitMatch();
    }

    async scoreAttribution() {
        if (this.game && this.items) {
            this.isAllGoodAnswerChecked = true;
            for (let index = 0; index < this.game.questions[this.questionNumber].choices.length; index++) {
                if (this.items[index].isBoxChecked !== this.game.questions[this.questionNumber].choices[index].isCorrect) {
                    this.isAllGoodAnswerChecked = false;
                    await this.playersListManagementService.wrongAnswer(this.isAllGoodAnswerChecked, this.questionNumber);
                    break;
                }
            }
            if (this.isAllGoodAnswerChecked) {
                await this.playersListManagementService.scoreAttribution(this.isAllGoodAnswerChecked, this.questionNumber, false);
            }
        }
    }
}
