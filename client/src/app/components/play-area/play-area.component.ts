/* eslint-disable max-params */
import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CheckBox } from '@app/interfaces/check-box';
import { Game } from '@app/interfaces/game';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { PopupService } from '@app/services/popup/popup.service';
import { TimeService } from '@app/services/time/time.service';
import { BONUS_POINTS } from '@common/constants';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit {
    protected isEndButtonClicked: boolean = false;
    protected playerPoints: number = 0;
    protected whiteIshColor: string = '#d9e5d6';
    protected blueIshColor: string = '#0fa3b1';
    protected items: CheckBox[];
    protected points: number;
    protected questionNumber: number = 0;
    protected isQuestionAnswered: boolean = false;
    private game: Game;
    private isAllGoodAnswerChecked: boolean = true;

    constructor(
        private router: Router,
        private zone: NgZone,
        private popupService: PopupService,
        private matchQuestionManagementService: MatchQuestionManagementService,
        private timeService: TimeService,
        private matchManagementService: MatchManagementService,
    ) {}

    get time(): number {
        return Number(this.matchQuestionManagementService.time);
    }

    get playerPoint() {
        return this.playerPoints;
    }

    private set playerPoint(newPlayerPoint: number) {
        this.playerPoints = newPlayerPoint;
    }

    async ngOnInit(): Promise<void> {
        this.matchQuestionManagementService.init();
        this.matchQuestionManagementService.questionDone.subscribe(() => {
            this.scoreAttribution();
            this.qcmResult();
        });
        this.matchQuestionManagementService.timeIsUp.subscribe(async () => {
            if (this.items === undefined) {
                this.isAllGoodAnswerChecked = false;
                this.qcmResult();
            } else {
                this.timerEnded();
            }
        });
    }

    checkBoxValidation(item: CheckBox[]) {
        this.isEndButtonClicked = true;
        this.items = item;
        this.scoreAttribution();
        this.qcmResult();
    }

    checkBoxInformation(item: CheckBox[]) {
        this.items = item;
    }

    dataBaseInfo(info: Game) {
        this.game = info;
    }

    questionPoints(points: number) {
        this.points = points;
    }

    qrlAnswered() {
        this.playerPoint += this.points;
        this.matchQuestionManagementService.stopTimer();
        this.nextQuestion();
    }

    nextQuestion(): void {
        this.popupService.closePopup();
        if (this.questionNumber === this.game.questions.length - 1) {
            this.matchManagementService.exitMatch();
            this.zone.run(() => {
                this.router.navigate(['/games']);
            });
        } else {
            this.questionNumber += 1;
            this.matchQuestionManagementService.questionOver();
        }
    }
    endingQuiz() {
        this.timeService.stopTimer();
        this.questionNumber = this.game.questions.length - 1;
    }

    private qcmResult(): void {
        this.matchQuestionManagementService.qcmResult(true);
        this.nextQuestion();
    }

    private timerEnded(): void {
        this.scoreAttribution();
        this.qcmResult();
    }

    private scoreAttribution() {
        for (let index = 0; index < this.game.questions[this.questionNumber].choices.length; index++) {
            if (this.items[index].isBoxChecked !== this.game.questions[this.questionNumber].choices[index].isCorrect) {
                this.isAllGoodAnswerChecked = false;
                break;
            }
        }
        if (this.isAllGoodAnswerChecked) {
            this.playerPoint += this.points + this.points * BONUS_POINTS;
            this.popupService.openPopup('Points bonus ajoutee', 0);
        }
        this.isAllGoodAnswerChecked = true;
    }
}
