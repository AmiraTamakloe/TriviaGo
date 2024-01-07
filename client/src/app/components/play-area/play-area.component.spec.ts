/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '@app/components/button/button.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { QuestionDescriptionComponent } from '@app/components/question-description/question-description.component';
import { TimerControlComponent } from '@app/components/timer-control/timer-control.component';
import { CheckBox } from '@app/interfaces/check-box';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { PopupService } from '@app/services/popup/popup.service';
import { TimeService } from '@app/services/time/time.service';
import { TimerService } from '@app/services/timer/timer.service';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;

const info: Game = {
    id: 'dkfsdfsdf',
    $schema: 'schema test',
    visible: true,
    title: 'mario',
    description: 'maman',
    duration: 4,
    lastModification: 'yesterday',
    questions: [
        {
            type: 'ok',
            text: 'pardon',
            points: 4,
            choices: [{ text: 'ok', isCorrect: true }],
        },
    ],
};

const infoQRL: Game = {
    id: 'dkfsdfsdf',
    $schema: 'schema test',
    visible: true,
    title: 'mario',
    description: 'maman',
    duration: 4,
    lastModification: 'yesterday',
    questions: [
        {
            type: 'QRL',
            text: 'pardon',
            points: 4,
            choices: [{ text: 'ok', isCorrect: false }],
        },
    ],
};

const infoBad: Game = {
    id: 'dkfsdfsdf',
    $schema: 'schema test',
    visible: true,
    title: 'mario',
    description: 'maman',
    duration: 4,
    lastModification: 'yesterday',
    questions: [
        {
            type: 'ok',
            text: 'pardon',
            points: 4,
            choices: [{ text: 'ok', isCorrect: false }],
        },
    ],
};
describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let timeServiceSpy: SpyObj<TimeService>;
    let gameServiceSpy: SpyObj<GameService>;
    let popupServiceSpy: SpyObj<PopupService>;
    let matchManagementServiceSpy: jasmine.SpyObj<MatchManagementService>;
    let matchQuestionManagementServiceSpy: jasmine.SpyObj<MatchQuestionManagementService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let timerSpy: TimerService;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        matchQuestionManagementServiceSpy = jasmine.createSpyObj(
            'MatchQuestionManagementService',
            [
                'getIsEveryPlayerDone',
                'setIsEveryPlayerDone',
                'timeAnswered',
                'matchOver',
                'questionDone',
                'playerAnswerIndex',
                'init',
                'qcmResult',
                'questionOver',
                'stopTimer',
            ],
            {
                time: '0',
                questionDone: new EventEmitter(),
                nextQuestion: new EventEmitter(),
                answerResult: new EventEmitter(),
                timeIsUp: new EventEmitter(),
                resetTimerControls: new EventEmitter(),
            },
        );
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['gameInformation', 'fetchGameById']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['openPopup', 'closePopup']);
        matchManagementServiceSpy = jasmine.createSpyObj('MatchManagementService', [
            'getMatchId',
            'getIsHost',
            'getIsOrganizer',
            'finalResult',
            'exitMatch',
        ]);
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent, PlayerInfoComponent, QuestionDescriptionComponent, ButtonComponent, TimerControlComponent],
            imports: [HttpClientModule, MatIconModule, MatSnackBarModule],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useValue: mockDialog },
                { provide: MatchManagementService, useValue: matchManagementServiceSpy },
                { provide: MatchQuestionManagementService, useValue: matchQuestionManagementServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({ organizer: 'true' }),
                        snapshot: {
                            params: { id: '1234' },
                        },
                    },
                },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: PopupService, useValue: popupServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        timerSpy = TestBed.inject(TimerService);
        component = fixture.componentInstance;
        gameServiceSpy.fetchGameById.and.returnValue(of(info));
        fixture.detectChanges();
        component['game'] = {
            questions: [
                {
                    type: 'ok',
                    text: 'pardon',
                    points: 4,
                    choices: [
                        { text: 'ok', isCorrect: true },
                        { text: 'ok', isCorrect: true },
                    ],
                },
            ],
        } as Game;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should increment playerPoint when all answers are correct', () => {
        component['isAllGoodAnswerChecked'] = true;
        component['points'] = 10;
        component['playerPoint'] = 20;

        component['game'] = info;
        matchQuestionManagementServiceSpy.setIsEveryPlayerDone(true);
        component.checkBoxValidation([
            { choices: '1 : blanc', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '2 : coquille', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '3 : vert', isBoxChecked: false, buttonColor: component['whiteIshColor'] },
        ]);

        expect(component.playerPoint).toBe(32);
    });

    it('should not increment playerPoint when all answers are bad', () => {
        component['isAllGoodAnswerChecked'] = true;
        component['points'] = 10;
        component['playerPoint'] = 20;

        component['game'] = infoBad;
        component.checkBoxValidation([
            { choices: '1 : blanc', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '2 : coquille', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '3 : vert', isBoxChecked: false, buttonColor: component['whiteIshColor'] },
        ]);

        expect(component.playerPoint).toBe(20);
    });

    it('should update properties and call qcmResult when all answers are correct', () => {
        component['isAllGoodAnswerChecked'] = true;
        component['points'] = 10;
        component['playerPoint'] = 20;
        component['items'] = [];

        component['game'] = info;
        const item: CheckBox[] = [
            { choices: '1 : blanc', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '2 : coquille', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '3 : vert', isBoxChecked: false, buttonColor: component['whiteIshColor'] },
        ];
        component['items'] = item;
        component['timerEnded']();

        expect(component.playerPoint).toBe(32);
    });

    it('should call scoreAttribution', () => {
        component['game'] = info;
        const item: CheckBox[] = [
            { choices: '1 : blanc', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '2 : coquille', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '3 : vert', isBoxChecked: false, buttonColor: component['whiteIshColor'] },
        ];
        component['items'] = item;
        component['scoreAttribution']();
        expect(component['isAllGoodAnswerChecked']).toBe(true);
    });

    it('should not update playerPoint when not all answers are correct', () => {
        component['isAllGoodAnswerChecked'] = false;
        component['points'] = 10;
        component['playerPoint'] = 20;
        component['game'] = info;
        const item: CheckBox[] = [
            { choices: '1 : blanc', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '2 : coquille', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '3 : vert', isBoxChecked: false, buttonColor: component['whiteIshColor'] },
        ];
        component['items'] = item;
        component['timerEnded']();

        expect(component.playerPoint).toBe(20);
    });

    it('should increment questionNumber and start timer when not reaching the last question', () => {
        component['questionNumber'] = -1;
        component['game'] = infoQRL;
        component['nextQuestion']();

        expect(component['questionNumber']).toBe(0);
        expect(component['isQuestionAnswered']).toBe(false);
    });

    it('should stop because it reach the last question', () => {
        component['questionNumber'] = 0;
        component['game'] = infoQRL;
        component['nextQuestion']();

        expect(component['questionNumber']).toBe(0);
        expect(component['isQuestionAnswered']).toBe(false);
    });

    it('should set the points property correctly', () => {
        const points = 100;
        component.questionPoints(points);
        expect(component['points']).toBe(points);
    });

    it('should call qcmResult when timer is running, time is 0 and items is undefined', () => {
        timerSpy['remainingTimeValue'] = '0';
        component.ngOnInit();

        matchQuestionManagementServiceSpy.timeIsUp.emit();
        expect(matchQuestionManagementServiceSpy.time).toEqual('0');
    });

    it('should set this.game correctly', () => {
        component.dataBaseInfo(info);
        expect(component['game']).toEqual(info);
    });

    it('should set this.items correctly', () => {
        const item: CheckBox[] = [
            { choices: '1', buttonColor: component['blueIshColor'], isBoxChecked: false },
            { choices: '2', buttonColor: component['blueIshColor'], isBoxChecked: true },
        ];
        component.checkBoxInformation(item);
        expect(component['items']).toEqual(item);
    });

    it('should stop the timer and set the question number to the last question', () => {
        component.endingQuiz();
        expect(timeServiceSpy.stopTimer).toHaveBeenCalled();
    });

    it('items should be defined when timeisup', () => {
        component['items'] = [
            { choices: '1', buttonColor: component['blueIshColor'], isBoxChecked: false },
            { choices: '2', buttonColor: component['blueIshColor'], isBoxChecked: true },
        ];
        matchQuestionManagementServiceSpy.timeIsUp.emit();
        component.ngOnInit();

        expect(component['items']).toBeDefined();
    });

    it('isAllGoodAnserChecked should be true when question done', fakeAsync(() => {
        component['game'] = {
            questions: [
                {
                    type: 'ok',
                    text: 'pardon',
                    points: 4,
                    choices: [
                        { text: 'ok', isCorrect: true },
                        { text: 'ok', isCorrect: true },
                    ],
                },
            ],
        } as Game;
        component['items'] = [
            { choices: '1', buttonColor: component['blueIshColor'], isBoxChecked: true },
            { choices: '2', buttonColor: component['blueIshColor'], isBoxChecked: false },
        ];
        matchQuestionManagementServiceSpy.questionDone.emit();
        component.ngOnInit();
        tick(3000);
        expect(component['isAllGoodAnswerChecked']).toBeTrue();
    }));

    it('should increment playerPoint when qrl is answered', () => {
        component['points'] = 10;
        component['playerPoint'] = 20;
        component['game'] = infoQRL;
        component['qrlAnswered']();

        expect(component.playerPoint).toBe(30);
    });
});
