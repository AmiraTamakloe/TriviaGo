/* eslint-disable @typescript-eslint/no-empty-function */
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@app/components/button/button.component';
import { QrlTextBoxComponent } from '@app/components/qrl-text-box/qrl-text-box.component';
import { TimerControlComponent } from '@app/components/timer-control/timer-control.component';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { MouseService } from '@app/services/mouse/mouse.service';
import { TimeService } from '@app/services/time/time.service';
import { Subscription, of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
const cinq = 5;
const ID = 'dkfsdfsdf';

const info: Game = {
    id: 'dkfsdfsdf',
    $schema: 'this is schema',
    visible: true,
    title: 'mario',
    description: 'maman',
    lastModification: 'yesterday',
    duration: 4,
    questions: [
        {
            type: 'QRL',
            text: 'pardon',
            points: 4,
            choices: [{ text: 'ok', isCorrect: true }],
        },
    ],
};

const info2: Game = {
    id: 'dkfsdfsdf',
    $schema: 'this is schema',
    visible: true,
    title: 'mario',
    description: 'maman',
    lastModification: 'yesterday',
    duration: 4,
    questions: [
        {
            type: 'QCM',
            text: 'pardon',
            points: 4,
            choices: [{ text: 'ok', isCorrect: true }],
        },
    ],
};

const info3: Game = {
    id: 'dkfsdfsdf',
    $schema: 'this is schema',
    visible: true,
    title: 'mario',
    description: 'maman',
    lastModification: 'yesterday',
    duration: 4,
    questions: [
        {
            type: 'QCM',
            text: 'pardon',
            points: 4,
            choices: [{ text: 'ok', isCorrect: false }],
        },
    ],
};

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let subscriptions: jasmine.SpyObj<Subscription>[];
    let subscriptionSpy: jasmine.SpyObj<Subscription>[];
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let timeServiceSpy: SpyObj<TimeService>;
    let gameServiceSpy: SpyObj<GameService>;
    let mouseServiceSpy: SpyObj<MouseService>;
    let checkboxEmitSpy: jasmine.Spy;
    let fixture: ComponentFixture<ButtonComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let matchManagementServiceSpy: jasmine.SpyObj<MatchManagementService>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
    let mockQrlTextBoxComponent: jasmine.SpyObj<QrlTextBoxComponent>;
    let matchQuestionManagementServiceSpy: jasmine.SpyObj<MatchQuestionManagementService>;
    beforeEach(() => {
        subscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
        matchManagementServiceSpy = jasmine.createSpyObj(
            'MatchManagementService',
            ['init', 'sendMatchAboutToStart', 'lockPopup', 'startMatch', 'exitMatch', 'getIsOrganizer', 'finalResult'],
            {
                isOrganizer: false,
            },
        );
        matchQuestionManagementServiceSpy = jasmine.createSpyObj(
            'MatchQuestionManagementService',
            ['questionOver', 'isQcm', 'newMatch', 'startTimer', 'enterClick', 'firstInteraction', 'playerAnswerIndex'],
            {
                questionType: 'QRL',
                nextQuestion: new EventEmitter<boolean>(true),
                answerResult: new EventEmitter<boolean>(false),
                qrlAnswered: new EventEmitter<void>(),
                timeIsUp: new EventEmitter<void>(),
                resetTimerControls: new EventEmitter<void>(),
            },
        );
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['fetchGameById']);
        mouseServiceSpy = jasmine.createSpyObj('MouseService', ['leftClickDetect']);
        mockQrlTextBoxComponent = jasmine.createSpyObj('QrlTextBoxComponent', ['reset']);
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['queryParams'], {
            queryParams: of({ organizer: 'true' }),
        });
        TestBed.configureTestingModule({
            declarations: [ButtonComponent, TimerControlComponent],
            providers: [
                { provide: MatchManagementService, useValue: matchManagementServiceSpy },
                { provide: MatDialog, useValue: mockDialog },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: MouseService, useValue: mouseServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: QrlTextBoxComponent, value: mockQrlTextBoxComponent },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: {
                                id: ID,
                            },
                        },
                        queryParams: of({ organizer: 'true' }),
                    },
                },
                { provide: MatchQuestionManagementService, useValue: matchQuestionManagementServiceSpy },
            ],
            imports: [MatSnackBarModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        gameServiceSpy.fetchGameById.and.returnValue(of(info));
        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
        mouseServiceSpy.leftClickDetect.and.returnValue(true);
        fixture.detectChanges();
        subscriptions = Array(cinq).fill(subscriptionSpy);
        component['game'] = info;
        checkboxEmitSpy = spyOn(component.checkbox, 'emit');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('checkBoxDetect should loop through the else', () => {
        const expectedKey = '1';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component['items'] = [
            { choices: '1 : 1914', isBoxChecked: false, buttonColor: '#d9e5d6' },
            { choices: '2 : 1418', isBoxChecked: false, buttonColor: '#d9e5d6' },
            { choices: '3 : Je sais pas', isBoxChecked: false, buttonColor: '#d9e5d6' },
        ];
        component.checkBoxDetect(buttonEvent);
        expect(component['items'][0].isBoxChecked).toBe(true);
    });

    it('isEndButtonClicked to be true', () => {
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.checkBoxDetect(buttonEvent);
        expect(component['isEndButtonClicked']).toBe(true);
    });

    it('checkBoxDetect should return nothing when isEndButtonClicked is true', () => {
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component['isEndButtonClicked'] = true;
        expect(component.checkBoxDetect(buttonEvent)).toBeUndefined();
    });

    it('checkBoxDetect should loop through the last else', () => {
        const expectedKey = '1';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component['items'] = [
            { choices: '1 : 1914', isBoxChecked: true, buttonColor: '#d9e5d6' },
            { choices: '2 : 1418', isBoxChecked: true, buttonColor: '#d9e5d6' },
            { choices: '3 : Je sais pas', isBoxChecked: true, buttonColor: '#d9e5d6' },
        ];
        component.checkBoxDetect(buttonEvent);
        expect(component['items'][0].buttonColor).toEqual(component['whiteIshColor']);
    });

    it('should populate items array correctly', () => {
        const index = 1;
        component['game'] = info;

        component.questionNumber = 0;
        component['buttonIndicator'](index);
        expect(component['items'].length).toBe(index);
    });

    it('should call nextQuestion', () => {
        component.qrlTextBox = mockQrlTextBoxComponent;
        component.isResults = true;
        component.nextQuestion();
        expect(component['nextButtonVisible']).toBeFalse();
    });

    it('should toggle button color and checkbox state', () => {
        component['items'] = [
            { choices: '1', buttonColor: component['whiteIshColor'], isBoxChecked: false },
            { choices: '2', buttonColor: component['whiteIshColor'], isBoxChecked: true },
        ];
        component.buttonClicked(0);
        expect(component['items'][0].buttonColor).toBe(component['blueIshColor']);
        expect(component['items'][0].isBoxChecked).toBe(true);
        expect(component['items'][1].buttonColor).toBe(component['whiteIshColor']);
        expect(component['items'][1].isBoxChecked).toBe(true);
    });

    it('should toggle button color and checkbox state', () => {
        component['items'] = [
            { choices: '1', buttonColor: component['blueIshColor'], isBoxChecked: false },
            { choices: '2', buttonColor: component['blueIshColor'], isBoxChecked: true },
        ];
        component.buttonClicked(0);
        expect(component['items'][0].buttonColor).toBe(component['whiteIshColor']);
        expect(component['items'][0].isBoxChecked).toBe(true);
        expect(component['items'][1].buttonColor).toBe(component['blueIshColor']);
        expect(component['items'][1].isBoxChecked).toBe(true);
    });

    it('should update items array and emit isCurrentQuestion', () => {
        component['items'] = [{ choices: '1', buttonColor: 'initialColor', isBoxChecked: false }];
        component.questionNumber = 0;
        component['game'] = info2;
        component['nextButtonIndicator'](1);
        expect(component['items'].length).toBe(1);
        expect(component['items'][0].choices).toBe('1 : ok');
        expect(component['items'][0].isBoxChecked).toBe(false);
        expect(component['items'][0].buttonColor).toBe(component['whiteIshColor']);
    });

    it('should emit items when left button is clicked', () => {
        component.questionType = 'QCM';
        component['isLeftButtonClicked'] = true;
        component['items'] = [{ choices: '1', buttonColor: 'initialColor', isBoxChecked: false }];
        component.endingButton({ button: 0 } as MouseEvent);
        expect(mouseServiceSpy.leftClickDetect).toHaveBeenCalledWith(0);
    });

    it('should emit qrlAnswered when left button is clicked and question is QRL', () => {
        const emitSpy = spyOn(component.qrlAnswered, 'emit');
        component.questionType = 'QRL';
        component['isLeftButtonClicked'] = true;
        component.endingButton({ button: 0 } as MouseEvent);
        expect(mouseServiceSpy.leftClickDetect).toHaveBeenCalledWith(0);
        expect(emitSpy).toHaveBeenCalled();
    });

    it('should update items array with correct button colors and reset isBoxChecked', () => {
        component['game'] = info3;
        component.questionNumber = 0;
        component['items'] = [
            { choices: '1', buttonColor: 'initialColor', isBoxChecked: false },
            { choices: '2', buttonColor: '#137807', isBoxChecked: true },
        ];
        component['answerIndicator']();
        expect(component['items'][0].buttonColor).toBe(component['redColor']);
        expect(component['items'][1].buttonColor).toBe(component['greenColor']);
        expect(component['items'][0].isBoxChecked).toBe(false);
        expect(component['items'][1].isBoxChecked).toBe(true);
    });

    it('should update items array with correct button colors and reset isBoxChecked', () => {
        component['game'] = info;
        component.questionNumber = 0;
        component['items'] = [
            { choices: '1', buttonColor: 'initialColor', isBoxChecked: false },
            { choices: '2', buttonColor: '#137807', isBoxChecked: true },
        ];
        component['answerIndicator']();
        expect(component['items'][0].buttonColor).toBe(component['greenColor']);
        expect(component['items'][1].buttonColor).toBe(component['greenColor']);
        expect(component['items'][0].isBoxChecked).toBe(false);
        expect(component['items'][1].isBoxChecked).toBe(true);
    });

    it('should initialize properly', async () => {
        component.questionNumber = 0;
        component['items'] = [
            { choices: '1 : 1914', isBoxChecked: false, buttonColor: '#137807' },
            { choices: '2 : 1418', isBoxChecked: false, buttonColor: '#d9e5d6' },
            { choices: '3 : Je sais pas', isBoxChecked: false, buttonColor: '#d9e5d6' },
        ];
        matchQuestionManagementServiceSpy.isQcm.and.returnValue(true);
        matchQuestionManagementServiceSpy.answerResult.next(true);
        component.ngOnInit();
        expect(component['items'].length).toBe(3);
    });

    it('should call unsubscribe for each subscription and endGame for each service when ngOnDestroy is called', () => {
        component['subscriptions'] = subscriptions;
        component.ngOnDestroy();
        subscriptions.forEach((subscription) => expect(subscription.unsubscribe).toHaveBeenCalled());
    });
    it('should call questionOver on next question', () => {
        component['isResults'] = false;
        component.qrlTextBox = {
            reset: () => {},
        } as QrlTextBoxComponent;
        component.nextQuestion();
        expect(component['validateDisabled']).toBeFalse();
    });
    it('should emit checkbox on qcm', () => {
        matchQuestionManagementServiceSpy.isQcm.and.returnValue(true);
        component.endingButton({ button: 0 } as MouseEvent);
        expect(checkboxEmitSpy).toHaveBeenCalled();
    });
    it('should put validate disabled to false on nextQuestion event', () => {
        matchQuestionManagementServiceSpy.isQcm.and.returnValue(true);
        matchQuestionManagementServiceSpy.nextQuestion.emit();
        expect(component['validateDisabled']).toBeFalse();
    });
});
