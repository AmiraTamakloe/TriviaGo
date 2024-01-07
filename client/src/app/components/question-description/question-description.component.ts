/* eslint-disable max-params */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { TimerService } from '@app/services/timer/timer.service';

@Component({
    selector: 'app-question-description',
    templateUrl: './question-description.component.html',
    styleUrls: ['./question-description.component.scss'],
})
export class QuestionDescriptionComponent implements OnInit {
    @Input() questionNumber: number;
    @Output() timerValue = new EventEmitter<number>();
    @Output() timeValue = new EventEmitter<number>();
    @Output() point = new EventEmitter<number>();
    @Output() isCurrentQuestion = new EventEmitter<boolean>();
    protected question: string;
    protected description: string;
    protected points: number;
    protected timerTime: number;
    protected game: Game;
    constructor(
        readonly timer: TimerService,
        private gameService: GameService,
        private route: ActivatedRoute,
        private matchQuestionManagementService: MatchQuestionManagementService,
    ) {}

    get time(): string {
        this.timeValue.emit(Number(this.timer.remainingTime));
        return this.matchQuestionManagementService.time;
    }

    get questionTitle() {
        return this.question;
    }
    get questionDescription() {
        return this.description;
    }

    get questionPoints() {
        return this.points;
    }

    private set questionTitle(newQuestionTitle: string) {
        this.question = newQuestionTitle;
    }

    private set questionDescription(newQuestion: string) {
        this.description = newQuestion;
    }
    private set questionPoints(newQuestionPoint: number) {
        this.points = newQuestionPoint;
    }

    async ngOnInit(): Promise<void> {
        this.initialization();
        this.matchQuestionManagementService.nextQuestion.subscribe(() => {
            this.nextQuestion();
        });
    }

    private initialization() {
        this.gameService.fetchGameById(this.route.snapshot.params.id).subscribe((res) => {
            this.game = res as Game;
            this.questionPoints = this.game.questions[this.questionNumber].points;
            this.timerTime = this.game.duration;
            this.questionTitle = this.game.title;
            this.questionDescription = this.game.questions[this.questionNumber].text;
            this.point.emit(this.questionPoints);
        });
    }

    private async nextQuestion(): Promise<void> {
        this.questionTitle = this.game.title;
        this.questionDescription = this.game.questions[this.questionNumber].text;
        this.questionPoints = this.game.questions[this.questionNumber].points;
        this.point.emit(this.questionPoints);
    }
}
