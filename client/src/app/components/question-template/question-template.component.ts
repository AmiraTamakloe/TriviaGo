/* eslint-disable max-params */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, NgZone, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { FormValidationService } from '@app/services/form-validation/form-validation.service';
import { GameService } from '@app/services/game/game.service';
import { ModificationGameService } from '@app/services/modification-game/modification-game.service';
import { PopupService } from '@app/services/popup/popup.service';
import {
    CHARACTER_LIMIT,
    DURATION_INCREMENT,
    HTTP_STATUS_BAD_REQUEST,
    HTTP_STATUS_CREATED_REQUEST,
    HTTP_STATUS_NO_CONTENT_REQUEST,
    HTTP_STATUS_SUCCESS_REQUEST,
    MAX_POINTS,
    MIN_POINTS,
    POPUP_DURATION,
} from '@common/constants';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-question-template',
    templateUrl: './question-template.component.html',
    styleUrls: ['./question-template.component.scss'],
})
export class QuestionTemplateComponent implements OnInit {
    @Input() isModif: boolean = this.modificationGameService.isDiff;
    game: Game;
    question: Question;
    status: 'initial' | 'uploading' | 'success' | 'fail' = 'initial';
    activeChoice: string;
    activeNote: string;
    durationArray: number[] = Array.from({ length: 51 }, (_, index) => index + DURATION_INCREMENT);
    protected profileForm = this.fb.group({
        title: [''],
        description: [''],
        duration: ['10'],
        questions: this.fb.array([]),
    });
    private truncatedValue: string | null = '';

    constructor(
        public fb: FormBuilder,
        private route: ActivatedRoute,
        private formValidationService: FormValidationService,
        protected gameService: GameService,
        private popupService: PopupService,
        private router: Router,
        private zone: NgZone,
        private modificationGameService: ModificationGameService,
    ) {}

    get questions() {
        return this.profileForm.get('questions') as FormArray;
    }

    ngOnInit(): void {
        const gameId = this.route.snapshot.params.id;
        if (this.isModif && gameId) {
            this.gameService.fetchGameById(gameId).subscribe(this.initializeGame);
        }
    }

    addQuestion(isNew: boolean) {
        const questionGroup = this.fb.group({
            type: ['QCM'],
            text: ['', [Validators.required, this.maxLengthValidator(CHARACTER_LIMIT)]],
            points: ['', [Validators.required, Validators.min(MIN_POINTS), Validators.max(MAX_POINTS)]],
            choices: this.fb.array([]),
        });
        this.questions.push(questionGroup);
        if (isNew) {
            this.addChoice(questionGroup);
            this.addChoice(questionGroup);
        }
    }

    addChoice(questionGroup: AbstractControl) {
        const choices = questionGroup.get('choices') as FormArray;
        const newChoiceGroup = this.fb.group({
            text: [''],
            isCorrect: [false],
        });
        choices.push(newChoiceGroup);
    }

    getChoices(questionGroup: AbstractControl) {
        return questionGroup.get('choices') as FormArray;
    }

    dropQuestion(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.questions.controls, event.previousIndex, event.currentIndex);
        moveItemInArray(this.questions.value, event.previousIndex, event.currentIndex);
    }

    dropChoice(event: CdkDragDrop<string[]>, questionGroup: AbstractControl) {
        const choices = questionGroup.get('choices') as FormArray;
        moveItemInArray(choices.controls, event.previousIndex, event.currentIndex);
        moveItemInArray(choices.value, event.previousIndex, event.currentIndex);
    }

    enterQuestion(index: number) {
        this.activeNote = this.questions.controls[index].get('text')?.value;
    }

    enterChoice(index: number, questionGroup: AbstractControl) {
        const choices = questionGroup.get('choices') as FormArray;
        this.activeChoice = choices.controls[index].get('text')?.value;
    }

    deleteQuestion(index: number) {
        this.questions.removeAt(index);
    }

    deleteChoice(questionGroup: AbstractControl, index: number) {
        const choices = questionGroup.get('choices') as FormArray;
        choices.removeAt(index);
    }

    async onSubmit() {
        let game;
        if (this.isModif) {
            game = this.formValidationService.patchGame(this.profileForm.value, this.game.id);
            this.redirectToPage(game);
        } else {
            game = this.formValidationService.postGame(this.profileForm.value);
            this.redirectToPage(game);
        }
    }

    private maxLengthValidator(maxLength: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: unknown } | null => {
            const value = control.value as string;
            if (value && value.length >= maxLength) {
                this.truncatedValue = value.substring(0, maxLength) + '...';
                if (control.value !== this.truncatedValue) {
                    control.setValue(this.truncatedValue, { emitEvent: false });
                    if (value.endsWith('..')) {
                        this.truncatedValue = value.substring(0, maxLength - 1);
                        control.setValue(this.truncatedValue, { emitEvent: false });
                    }
                }

                return { maxLengthExceeded: true };
            }
            return null;
        };
    }

    private redirectToPage(game: Observable<object>) {
        this.status = 'uploading';
        game.subscribe({
            next: () => {
                this.status = 'success';
                this.popupService.openPopup('Le jeu a été créé avec succès', POPUP_DURATION);
                this.zone.run(() => {
                    this.router.navigate(['']);
                });
            },
            error: (error: HttpErrorResponse) => {
                this.status = 'fail';
                switch (error.status) {
                    case HTTP_STATUS_SUCCESS_REQUEST:
                    case HTTP_STATUS_CREATED_REQUEST:
                    case HTTP_STATUS_NO_CONTENT_REQUEST: {
                        this.popupService.openPopup('Le jeu a été modifié avec succès', POPUP_DURATION);
                        this.zone.run(() => {
                            this.router.navigate(['']);
                        });

                        break;
                    }

                    case HTTP_STATUS_BAD_REQUEST: {
                        this.popupService.openPopup(error.error, POPUP_DURATION);

                        break;
                    }
                }

                return error;
            },
        });
    }

    private initializeGame = (res: Game) => {
        this.game = res as Game;
        const titleControl = this.profileForm?.get('title');
        const descriptionControl = this.profileForm?.get('description');
        const durationControl = this.profileForm?.get('duration');

        if (titleControl && descriptionControl && this.game.title && this.game.duration) {
            titleControl.setValue(this.game.title);
            durationControl?.setValue(this.game.duration.toString());
            if (this.game.description) {
                descriptionControl.setValue(this.game.description);
            }
        }
        this.loopOverQuestions();
    };

    private loopOverQuestions() {
        for (let i = 0; i < this.game.questions.length; i++) {
            this.addQuestion(false);
            const questionsArray = this.profileForm.get('questions') as FormArray;
            const questionGroup = questionsArray.at(i) as FormGroup;
            const currentQuestion = this.game.questions[i];
            questionGroup.patchValue({
                type: currentQuestion.type,
                text: currentQuestion.text,
                points: currentQuestion.points,
            });
            if (currentQuestion.type === 'QCM') {
                this.loopOverChoices(questionGroup, currentQuestion);
            }
        }
    }

    private loopOverChoices(questionGroup: FormGroup, currentQuestion: Question) {
        for (let j = 0; j < currentQuestion.choices.length; j++) {
            this.addChoice(questionGroup);
            const choicesArray = questionGroup.get('choices') as FormArray;
            const choiceGroup = choicesArray.at(j) as FormGroup;
            const currentChoice = currentQuestion.choices[j];
            choiceGroup.patchValue({
                text: currentChoice.text,
                isCorrect: currentChoice.isCorrect,
            });
        }
    }
}
