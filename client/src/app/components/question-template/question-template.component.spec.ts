/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '@app/components/header/header.component';
import { Game } from '@app/interfaces/game';
import { FormValidationService } from '@app/services/form-validation/form-validation.service';
import { GameService } from '@app/services/game/game.service';
import { ModificationGameService } from '@app/services/modification-game/modification-game.service';
import { PopupService } from '@app/services/popup/popup.service';
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_CREATED_REQUEST, HTTP_STATUS_NO_CONTENT_REQUEST, POPUP_DURATION } from '@common/constants';
import { of, throwError } from 'rxjs';
import { QuestionTemplateComponent } from './question-template.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionTemplateComponent', () => {
    let component: QuestionTemplateComponent;
    let fixture: ComponentFixture<QuestionTemplateComponent>;
    let popupServiceSpy: SpyObj<PopupService>;
    let gameServiceSpy: SpyObj<GameService>;
    let formValidationServiceSpy: SpyObj<FormValidationService>;
    let modificationServiceSpy: SpyObj<any>;
    let routerSpy: jasmine.SpyObj<Router>;

    const game: Game = {
        id: 'id',
        title: 'title',
        description: 'description',
        duration: 10,
        questions: [
            {
                type: 'QCM',
                text: 'text',
                points: 10,
                choices: [
                    {
                        text: 'text',
                        isCorrect: true,
                    },
                ],
            },
        ],
        $schema: '',
        visible: false,
        lastModification: '',
    };

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['gameInformation', 'fetchGameById']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['openPopup', 'closePopup']);
        modificationServiceSpy = jasmine.createSpyObj('ModificationGameService', ['isDiff']);
        formValidationServiceSpy = jasmine.createSpyObj('FormValidationService', ['postGame', 'patchGame']);
        formValidationServiceSpy.patchGame.and.returnValue(of({ success: true }));
        formValidationServiceSpy.postGame.and.returnValue(of({ success: true }));

        modificationServiceSpy.isDiff.and.returnValue(true);
        gameServiceSpy.fetchGameById.and.returnValue(of(game));

        TestBed.configureTestingModule({
            declarations: [QuestionTemplateComponent, HeaderComponent],
            imports: [ReactiveFormsModule, MatSnackBarModule, DragDropModule],
            providers: [
                FormBuilder,
                {
                    provide: FormValidationService,
                    useValue: formValidationServiceSpy,
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                id: 'id',
                            },
                        },
                    },
                },
                { provide: PopupService, useValue: popupServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: ModificationGameService, useValue: modificationServiceSpy },
                { provide: MatDialog, useValue: {} },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(QuestionTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(gameServiceSpy.fetchGameById).toHaveBeenCalled();
    });

    it('should submit', () => {
        component.isModif = false;
        component.onSubmit();
        expect(component).toBeTruthy();
    });

    it('should handle error of bad request on submit', fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({ status: HTTP_STATUS_BAD_REQUEST, error: 'Bad request' });
        formValidationServiceSpy.postGame.and.returnValue(throwError(() => errorResponse));
        formValidationServiceSpy.patchGame.and.returnValue(throwError(() => errorResponse));
        component.onSubmit();
        tick();
        expect(component.status).toBe('fail');
        expect(popupServiceSpy.openPopup).toHaveBeenCalledWith('Bad request', POPUP_DURATION);
    }));

    it('should handle error of created request on submit', fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({ status: HTTP_STATUS_CREATED_REQUEST, error: 'Created Request' });
        formValidationServiceSpy.postGame.and.returnValue(throwError(() => errorResponse));
        formValidationServiceSpy.patchGame.and.returnValue(throwError(() => errorResponse));
        component.onSubmit();
        tick();
        expect(component.status).toBe('fail');
    }));

    it('should handle error of no content request on submit', fakeAsync(() => {
        const errorResponse = new HttpErrorResponse({ status: HTTP_STATUS_NO_CONTENT_REQUEST, error: 'No Content Request' });
        formValidationServiceSpy.postGame.and.returnValue(throwError(() => errorResponse));
        formValidationServiceSpy.patchGame.and.returnValue(throwError(() => errorResponse));
        component.onSubmit();
        tick();
        expect(component.status).toBe('fail');
        expect(popupServiceSpy.openPopup).toHaveBeenCalledWith('Le jeu a été modifié avec succès', POPUP_DURATION);
    }));

    it('should add a question', async () => {
        const initialQuestionsLength = component.questions.length;
        component.addQuestion(false);
        expect(component.questions.length).toEqual(initialQuestionsLength + 1);
    });

    it('should get choices', async () => {
        const questionGroup = component.fb.group({
            type: ['QCM'],
            text: ['Sample Question'],
            points: ['20'],
            choices: component.fb.array([
                component.fb.group({
                    text: ['Choice 1'],
                    isCorrect: [true],
                }),
                component.fb.group({
                    text: ['Choice 2'],
                    isCorrect: [false],
                }),
            ]),
        });

        const choices = component.getChoices(questionGroup);

        expect(choices instanceof FormArray).toBeTruthy();
        expect(choices.length).toEqual(2);
    });

    it('should delete question correctly', async () => {
        const questionIndex = game.questions.length;
        component.addQuestion(false);
        expect(component.questions.length).toBe(questionIndex + 1);
        component.deleteQuestion(questionIndex);
        expect(component.questions.length).toBe(questionIndex);
    });

    it('should delete a choice', () => {
        const questionGroup = component.fb.group({
            type: ['QCM'],
            text: ['Sample Question Text'],
            points: ['10'],
            choices: component.fb.array([
                component.fb.group({ text: ['Choice 1'], isCorrect: [false] }),
                component.fb.group({ text: ['Choice 2'], isCorrect: [true] }),
            ]),
        });
        component.questions.push(questionGroup);
        component.deleteChoice(questionGroup, 0);
        const choices = questionGroup.get('choices') as FormArray;
        expect(choices.length).toEqual(1);
    });

    it('should set activeNote correctly', async () => {
        component.enterQuestion(0);
        expect(component.activeNote).toBe('text');
    });

    it('should add a question group to questions array', () => {
        const isNew = true;
        component.addQuestion(isNew);
        expect(component.questions.length).toBe(2);
    });

    it('should not truncate when the length is exactly the limit', () => {
        const control = new FormControl('Exactly 15 chars!');
        const validator = component['maxLengthValidator'](15);
        const result = validator(control);

        expect(result).toEqual({ maxLengthExceeded: true });
        expect(control.value).toBe('Exactly 15 char...');
    });

    it('should set activeChoice to the correct value', () => {
        const testIndex = 1;
        const testChoice = 'Test Choice';
        const questionGroup = new FormGroup({
            choices: new FormArray([
                new FormGroup({ text: new FormControl('Choice 1') }),
                new FormGroup({ text: new FormControl(testChoice) }),
                new FormGroup({ text: new FormControl('Choice 3') }),
            ]),
        });

        component.enterChoice(testIndex, questionGroup);

        expect(component.activeChoice).toBe(testChoice);
    });

    it('should truncate correctly when the value ends with ".."', () => {
        const maxLength = 15;
        const control = new FormControl('Exactly 15 chars..');
        const validator = component['maxLengthValidator'](maxLength);
        const result = validator(control);
        expect(result).toEqual({ maxLengthExceeded: true });
        expect(control.value).toBe('Exactly 15 cha');
        expect(component['truncatedValue']).toBe('Exactly 15 cha');
    });
});
