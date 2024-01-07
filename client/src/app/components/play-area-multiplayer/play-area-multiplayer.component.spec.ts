/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { PlayAreaMultiplayerComponent } from '@app/components/play-area-multiplayer/play-area-multiplayer.component';
import { PlayerInfoComponent } from '@app/components/player-info/player-info.component';
import { TimerControlComponent } from '@app/components/timer-control/timer-control.component';
import { CheckBox } from '@app/interfaces/check-box';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
import { MatchManagementService } from '@app/services/match-management/match-management.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { PlayersListManagementService } from '@app/services/players-list-management/players-list-management.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TimeService } from '@app/services/time/time.service';
import { Subject, Subscription, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import SpyObj = jasmine.SpyObj;

class SocketClientServiceMock extends SocketClientService {
    override connect() {}
}

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

describe('PlayAreaMultiplayerComponent', () => {
    let timeServiceSpy: SpyObj<TimeService>;
    let component: PlayAreaMultiplayerComponent;
    let fixture: ComponentFixture<PlayAreaMultiplayerComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let matchQuestionManagementServiceSpy: jasmine.SpyObj<MatchQuestionManagementService>;
    let matchManagementServiceSpy: jasmine.SpyObj<MatchManagementService>;
    let playersListManagementServiceSpy: jasmine.SpyObj<PlayersListManagementService>;
    let histogramInfoServiceSpy: jasmine.SpyObj<HistogramInfoService>;
    let gameServiceSpy: SpyObj<GameService>;
    let subscriptions: jasmine.SpyObj<Subscription>[];
    let subscriptionSpy: jasmine.SpyObj<Subscription>[];

    beforeEach(async () => {
        subscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
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
                'endGame',
                'isQcm',
            ],
            {
                time: '0',
                game: info,
                questionDone: new EventEmitter(),
                nextQuestion: new EventEmitter(),
                answerResult: new EventEmitter(),
                timeIsUp: new EventEmitter(),
                updateChart: new EventEmitter(),
            },
        );
        matchManagementServiceSpy = jasmine.createSpyObj(
            'MatchManagementService',
            ['finalResult', 'organizer', 'endGame', 'getIsOrganizer', 'exitMatch'],
            {
                displayFinalResults: new Subject(),
            },
        );
        matchQuestionManagementServiceSpy.isQcm.and.returnValue(true);
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer']);
        gameServiceSpy = jasmine.createSpyObj('GameService', ['gameInformation', 'fetchGameById']);
        histogramInfoServiceSpy = jasmine.createSpyObj('HistogramInfoService', ['addBarsForLastQuestion']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        playersListManagementServiceSpy = jasmine.createSpyObj(
            'PlayersListManagementService',
            ['init', 'scoreAttribution', 'closePopup', 'wrongAnswer', 'endGame'],
            { playersList: ['Player1', 'Player2', 'Player3'] },
        );
        await TestBed.configureTestingModule({
            declarations: [PlayAreaMultiplayerComponent, PlayerInfoComponent, TimerControlComponent, HistogramComponent],
            imports: [HttpClientModule, MatIconModule, MatSnackBarModule],
            providers: [
                { provide: MatchQuestionManagementService, useValue: matchQuestionManagementServiceSpy },
                { provide: MatchManagementService, useValue: matchManagementServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: HistogramInfoService, useValue: histogramInfoServiceSpy },
                { provide: PlayersListManagementService, useValue: playersListManagementServiceSpy },
                { provide: SocketClientService, useValue: socketServiceMock },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of({ organizer: 'true' }),
                        snapshot: {
                            params: { id: '1234' },
                        },
                    },
                },
                { provide: GameService, useValue: gameServiceSpy },
                GameService,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        matchQuestionManagementServiceSpy.getIsEveryPlayerDone.and.returnValue(of(true));
        gameServiceSpy.fetchGameById.and.returnValue(of(info));
        fixture = TestBed.createComponent(PlayAreaMultiplayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        subscriptions = Array(5).fill(subscriptionSpy);
        component['isEndButtonClicked'] = true;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call scoreAttribution', () => {
        component['items'] = [
            { choices: '1 : 1914', isBoxChecked: false, buttonColor: '#d9e5d6' },
            { choices: '2 : 1418', isBoxChecked: false, buttonColor: '#d9e5d6' },
            { choices: '3 : Je sais pas', isBoxChecked: false, buttonColor: '#d9e5d6' },
        ];

        component['game'] = info;
        component['isAllGoodAnswerChecked'] = true;
        component['scoreAttribution']();
        expect(component['isAllGoodAnswerChecked']).toBe(false);
    });

    it('should call scoreAttribution', () => {
        component['items'] = [
            { choices: '1 : 1914', isBoxChecked: true, buttonColor: '#d9e5d6' },
            { choices: '2 : 1418', isBoxChecked: true, buttonColor: '#d9e5d6' },
            { choices: '3 : Je sais pas', isBoxChecked: true, buttonColor: '#d9e5d6' },
        ];

        component['game'] = info;
        component['isAllGoodAnswerChecked'] = true;
        component['scoreAttribution']();
        expect(component['isAllGoodAnswerChecked']).toBe(true);
    });

    it('should call scoreAttribution and qcmResult when questionDone event is emitted', () => {
        const scoreAttributionSpy = spyOn(component, 'scoreAttribution');
        const qcmResultSpy = spyOn(component, 'qcmResult');
        matchQuestionManagementServiceSpy.questionDone.emit();
        expect(scoreAttributionSpy).toHaveBeenCalled();
        expect(qcmResultSpy).toHaveBeenCalled();
    });

    it('should call scoreAttribution and qcmResult when timerEnded is called', () => {
        const scoreAttributionSpy = spyOn(component, 'scoreAttribution');
        const qcmResultSpy = spyOn(component, 'qcmResult');
        component.timerEnded();
        expect(scoreAttributionSpy).toHaveBeenCalled();
        expect(qcmResultSpy).toHaveBeenCalled();
    });
    it('should set this.game correctly', () => {
        component.dataBaseInfo(info);
        expect(component['game']).toEqual(info);
    });

    it('should set organizer to true when query parameter is "true"', () => {
        component.setOrganizer();
        expect(component['organizer']).toBe(true);
    });

    it('should set this.items correctly', () => {
        const item: CheckBox[] = [
            { choices: '1', buttonColor: component['blueIshColor'], isBoxChecked: false },
            { choices: '2', buttonColor: component['blueIshColor'], isBoxChecked: true },
        ];
        component.checkBoxInformation(item);
        expect(component['items']).toEqual(item);
    });

    it('should return an empty array if no items is true', () => {
        const items: CheckBox[] = [
            { choices: '1 : blanc', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '2 : coquille', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '3 : vert', isBoxChecked: false, buttonColor: component['whiteIshColor'] },
        ];
        const indices = component.getAnswerIndex(items);
        expect(indices).toEqual([0, 1]);
    });

    it('should call scoreAttribution and qcmResult when time is 1 and items is undefined', () => {
        component['items'] = [];
        matchQuestionManagementServiceSpy.timeIsUp.emit();
        component.ngOnInit();
        expect(component['items'].length).toBe(0);
    });

    it('should call scoreAttribution and qcmResult when time is 1 and items is undefined', () => {
        matchQuestionManagementServiceSpy.timeIsUp.emit();
        component.ngOnInit();
        expect(component['items']).toBeUndefined();
    });

    it('should call scoreAttribution and qcmResult when time is 1 and items is undefined', () => {
        matchManagementServiceSpy.displayFinalResults.next();
        component.ngOnInit();
        expect(component['isGameOver']).toBeTrue();
    });

    it('should call displayResults', () => {
        matchManagementServiceSpy.organizer = true;
        component.displayResults();

        expect(histogramInfoServiceSpy.addBarsForLastQuestion).toHaveBeenCalled();
    });

    it('should call displayResults', () => {
        component['game'] = info;
        matchManagementServiceSpy.organizer = true;
        component['questionNumber'] = 1;
        component.nextQuestion();

        expect(component['questionNumber']).toEqual(2);
    });

    it('should call scoreAttribution and qcmResult when time is 1 and items is undefined', () => {
        component['items'] = [
            { choices: '1 : blanc', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '2 : coquille', isBoxChecked: true, buttonColor: component['whiteIshColor'] },
            { choices: '3 : vert', isBoxChecked: false, buttonColor: component['whiteIshColor'] },
        ];
        matchQuestionManagementServiceSpy.timeIsUp.emit();
        component.ngOnInit();

        expect(component['items']).toBeDefined();
    });

    it('should call matchQuestionManagementService methods and update component properties', fakeAsync(() => {
        const item: CheckBox[] = [
            { choices: '1', buttonColor: component['blueIshColor'], isBoxChecked: false },
            { choices: '2', buttonColor: component['blueIshColor'], isBoxChecked: true },
        ];
        component.checkBoxValidation(item);
        tick(3000);
        expect(matchQuestionManagementServiceSpy.playerAnswerIndex).toHaveBeenCalled();
        expect(matchQuestionManagementServiceSpy.timeAnswered).toHaveBeenCalled();
        expect(matchQuestionManagementServiceSpy.getIsEveryPlayerDone).toHaveBeenCalled();
        expect(component['items']).toEqual([
            { choices: '1', buttonColor: component['blueIshColor'], isBoxChecked: false },
            { choices: '2', buttonColor: component['blueIshColor'], isBoxChecked: true },
        ]);
        expect(component['isEndButtonClicked']).toBe(true);
    }));

    it('should call scoreAttribution and qcmResult when time is 1 and items is undefined', fakeAsync(() => {
        component['items'] = [
            { choices: '1', buttonColor: component['blueIshColor'], isBoxChecked: true },
            { choices: '2', buttonColor: component['blueIshColor'], isBoxChecked: false },
        ];
        component['game'] = info;
        matchQuestionManagementServiceSpy.questionDone.emit();
        component.ngOnInit();
        tick(3000);
        expect(component['isAllGoodAnswerChecked']).toBeTrue();
    }));

    it('should call unsubscribe for each subscription and endGame for each service when ngOnDestroy is called', () => {
        component['subscriptions'] = subscriptions;
        component.ngOnDestroy();
        subscriptions.forEach((subscription) => expect(subscription.unsubscribe).toHaveBeenCalled());
        expect(playersListManagementServiceSpy.endGame).toHaveBeenCalled();
        expect(matchQuestionManagementServiceSpy.endGame).toHaveBeenCalled();
        expect(matchManagementServiceSpy.endGame).toHaveBeenCalled();
    });
    it('should call nextQuestion on matchQuestionManagement nextQuestion event', () => {
        component['game'] = info;
        const nextQuestionSpy = spyOn(component, 'nextQuestion');
        matchQuestionManagementServiceSpy.nextQuestion.emit();
        expect(nextQuestionSpy).toHaveBeenCalled();
    });

    it('should call stopTimer when endingQuizz is called', () => {
        component.endingQuiz();
        expect(timeServiceSpy.stopTimer).toHaveBeenCalled();
    });
});
