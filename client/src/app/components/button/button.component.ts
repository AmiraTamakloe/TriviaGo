/* eslint-disable max-params */
import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QrlTextBoxComponent } from '@app/components/qrl-text-box/qrl-text-box.component';
import { CheckBox } from '@app/interfaces/check-box';
import { Game } from '@app/interfaces/game';
import { GameModeSelectionService } from '@app/services/game-mode-selection/game-mode-selection.service';
import { GameService } from '@app/services/game/game.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isResults: boolean;
    @Input() questionNumber: number;
    @Input() questionType: string;
    @Input() time: number;
    @Input() isEndButtonClicked: boolean;
    @Input() isQuestionAnswered: boolean;
    @Output() checkbox = new EventEmitter<CheckBox[]>();
    @Output() checkboxInfo = new EventEmitter<CheckBox[]>();
    @Output() bdInfo = new EventEmitter<Game>();
    @Output() nextQuestionEvent = new EventEmitter();
    @Output() displayResults = new EventEmitter();
    @Output() qrlAnswered = new EventEmitter();
    @ViewChild(QrlTextBoxComponent) qrlTextBox: QrlTextBoxComponent;
    items: CheckBox[] = [];
    whiteIshColor: string = '#d9e5d6';
    blueIshColor: string = '#0fa3b1';
    protected organizer: boolean;
    protected nextButtonVisible: boolean = true;
    protected playerPoints: number = 0;
    protected game: Game;
    protected redColor: string = '#bc0909';
    protected greenColor: string = '#137807';
    protected validateDisabled: boolean = false;
    private numberOfChoices: number;
    private isLeftButtonClicked: boolean = false;
    private subscriptions: Subscription[] = [];
    private isFirstInteractionDone: boolean = false;

    constructor(
        private mouseService: MouseService,
        private gameService: GameService,
        readonly matchManagementService: MatchManagementService,
        private route: ActivatedRoute,
        readonly gameMode: GameModeSelectionService,
        public matchQuestionManagementService: MatchQuestionManagementService,
    ) {}
    @HostListener('window:keydown', ['$event'])
    checkBoxDetect(event: KeyboardEvent) {
        if (Number(this.matchQuestionManagementService.time) !== 0 && !this.isEndButtonClicked) {
            if (event.key === 'Enter') {
                this.isEndButtonClicked = true;
                this.validateDisabled = true;
                this.checkbox.emit(this.items);
            } else {
                if (this.isNumeralKey(event.key) && !this.validateDisabled) {
                    this.items[Number(event.key) - 1].isBoxChecked = !this.items[Number(event.key) - 1].isBoxChecked;
                    if (this.items[Number(event.key) - 1].isBoxChecked) {
                        this.items[Number(event.key) - 1].buttonColor = this.blueIshColor;
                    } else {
                        this.items[Number(event.key) - 1].buttonColor = this.whiteIshColor;
                    }
                    this.checkboxInfo.emit(this.items);
                }
            }
        } else if (Number(this.matchQuestionManagementService.time) !== 0 && this.isEndButtonClicked) {
            return;
        }
    }

    async ngOnInit(): Promise<void> {
        this.setOrganizerValue();
        const id = this.route.snapshot.params.id;
        this.gameService.fetchGameById(id).subscribe((res) => {
            this.questionNumber = 0;
            this.game = res as Game;
            this.matchQuestionManagementService.timerControlsEnabled = true;
            this.matchQuestionManagementService.newMatch(res as Game);
            this.bdInfo.emit(this.game);
            this.questionType = this.game.questions[this.questionNumber].type;
            this.matchQuestionManagementService.nextButtonVisible = false;
            if (this.questionType === 'QCM') {
                this.numberOfChoices = this.game.questions[this.questionNumber].choices.length;
                this.buttonIndicator(this.numberOfChoices);
            }
            this.matchQuestionManagementService.startTimer();
        });
        this.subscriptions.push(
            this.matchQuestionManagementService.nextQuestion.subscribe(() => {
                this.validateDisabled = false;

                if (this.matchQuestionManagementService.isQcm()) {
                    this.nextButtonIndicator(this.game.questions[this.questionNumber].choices.length);
                }
            }),
            this.matchQuestionManagementService.answerResult.subscribe((value) => {
                if (value && this.matchQuestionManagementService.isQcm()) {
                    this.answerIndicator();
                }
            }),
            this.matchQuestionManagementService.timeIsUp.subscribe(async () => {
                this.validateDisabled = true;
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });

        this.organizer = this.matchManagementService.getIsOrganizer();
    }

    async ngOnChanges(): Promise<void> {
        this.nextButtonVisible = this.matchQuestionManagementService.nextButtonVisible;
    }

    setOrganizerValue() {
        this.route.queryParams.subscribe((params) => {
            this.organizer = params.organizer === 'true';
        });
    }

    buttonClicked(index: number) {
        if (!this.isFirstInteractionDone) {
            this.matchQuestionManagementService.firstInteraction();
            this.isFirstInteractionDone = true;
        }
        if (this.items[index].buttonColor === this.whiteIshColor) {
            this.items[index].buttonColor = this.blueIshColor;
            this.items[index].isBoxChecked = !this.items[index].isBoxChecked;
        } else {
            this.items[index].buttonColor = this.whiteIshColor;
            this.items[index].isBoxChecked = !this.items[index].isBoxChecked;
        }
        const checkedIndexes: number[] = [];
        this.items.forEach((item, i) => {
            if (item.isBoxChecked) {
                checkedIndexes.push(i);
            }
        });
        this.matchQuestionManagementService.playerAnswerIndex(checkedIndexes);
    }

    endingButton(event: MouseEvent) {
        this.isLeftButtonClicked = this.mouseService.leftClickDetect(event.button);
        if (this.isLeftButtonClicked) {
            this.matchQuestionManagementService.enterClick();
            this.validateDisabled = true;
            if (this.matchQuestionManagementService.isQcm()) {
                this.checkbox.emit(this.items);
            } else {
                this.qrlAnswered.emit();
                this.matchQuestionManagementService.qrlAnswered.emit();
            }
        }
    }

    nextQuestion() {
        this.nextButtonVisible = false;
        this.validateDisabled = false;
        if (!this.isResults) {
            if (this.matchQuestionManagementService.questionType === 'QRL' && !this.matchManagementService.organizer) {
                this.qrlTextBox.reset();
            }
            this.matchQuestionManagementService.questionOver();
        } else {
            this.displayResults.emit();
            this.matchManagementService.finalResult();
        }
    }

    private isNumeralKey(key: string): boolean {
        return !isNaN(parseInt(key, 10)) && parseInt(key, 10) >= 0 && parseInt(key, 10) <= this.items.length;
    }

    private buttonIndicator(index: number) {
        this.checkboxPopulate(index);
    }

    private nextButtonIndicator(index: number): void {
        this.items.length = 0;
        this.checkboxPopulate(index);
    }
    private answerIndicator(): void {
        for (let index = 0; index < this.game.questions[this.questionNumber].choices.length; index++) {
            if (this.game.questions[this.questionNumber].choices[index].isCorrect) {
                this.items[index].buttonColor = this.greenColor;
            } else {
                this.items[index].buttonColor = this.redColor;
            }
            this.items[index].isBoxChecked = false;
        }
    }
    private checkboxPopulate(index: number): void {
        this.isFirstInteractionDone = false;
        let i = 0;
        while (i !== index) {
            const itemPopulate: CheckBox = {
                choices: i + 1 + ' : ' + this.game.questions[this.questionNumber].choices[i].text,
                isBoxChecked: false,
                buttonColor: this.whiteIshColor,
            };
            this.items.push(itemPopulate);
            i += 1;
        }
    }
}
