import { EventEmitter, SimpleChange, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { GameService } from '@app/services/game/game.service';
import { HistogramInfoService } from '@app/services/histogram-info/histogram-info.service';
import { MatchQuestionManagementService } from '@app/services/match-question-management/match-question-management.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { HistogramBar } from '@common/histogram-bar';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { HistogramComponent } from './histogram.component';

class SocketClientServiceMock extends SocketClientService {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}
const mockGame = {
    $schema: 'quiz-schema.json',
    id: '1a2b3c1a2b3c1a2b3c1a2b3c',
    title: 'Questionnaire sur le JS',
    duration: 60,
    lastModification: '2018-11-13T20:20:39+00:00',
    visible: true,
    description: 'Un questionnaire sur le JS',
    questions: [
        {
            type: 'QCM',
            text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
            points: 40,
            choices: [
                {
                    text: 'var',
                    isCorrect: true,
                },
                {
                    text: 'self',
                    isCorrect: false,
                },
                {
                    text: 'this',
                    isCorrect: true,
                },
            ],
        },
    ],
};

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;
    let gameServiceSpy: jasmine.SpyObj<GameService>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let matchQuestionManagementServiceSpy: jasmine.SpyObj<MatchQuestionManagementService>;
    let histogramInfoServiceSpy: jasmine.SpyObj<HistogramInfoService>;
    let fakeQuestions: string[] = ['Q1', 'Q2'];
    let fakeBars: HistogramBar[] = [];

    beforeEach(() => {
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
                'updateChart',
                'endGame',
                'isQcm',
            ],
            {
                time: '0',
                updateChart: new EventEmitter(),
            },
        );
        histogramInfoServiceSpy = jasmine.createSpyObj('HistogramInfoService', ['addBars']);
        Object.defineProperty(histogramInfoServiceSpy, 'questions', {
            get: jasmine.createSpy().and.returnValue(fakeQuestions),
            set: jasmine.createSpy().and.callFake((value: string[]) => {
                fakeQuestions = value;
            }),
        });
        Object.defineProperty(histogramInfoServiceSpy, 'barsForLastQuestion', {
            get: jasmine.createSpy().and.returnValue(fakeBars),
            set: jasmine.createSpy().and.callFake((value: HistogramBar[]) => {
                fakeBars = value;
            }),
        });
        matchQuestionManagementServiceSpy.isQcm.and.returnValue(true);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;

        gameServiceSpy = jasmine.createSpyObj('GameService', ['fetchGameById']);

        TestBed.configureTestingModule({
            declarations: [HistogramComponent],
            providers: [
                { provide: GameService, useValue: gameServiceSpy },
                { provide: MatchQuestionManagementService, useValue: matchQuestionManagementServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: { id: 1 },
                            organizer: true,
                        },
                    },
                },
                { provide: HistogramInfoService, useValue: histogramInfoServiceSpy },
            ],
            imports: [MatSnackBarModule],
        }).compileComponents();

        gameServiceSpy.fetchGameById.and.returnValue(of(mockGame));
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call createChart when questionNumber changes', async () => {
        spyOn(component, 'createChart');
        component.questionNumber = 1;
        component['isQcm'] = true;
        const changes: SimpleChanges = {
            questionNumber: new SimpleChange(undefined, component.questionNumber, false),
        };
        await component.ngOnChanges(changes);
        expect(component.createChart).toHaveBeenCalled();
        expect(histogramInfoServiceSpy.addBars).toHaveBeenCalled();
    });

    it('should correctly set totalValue', async () => {
        component.totalValue = 3;
        expect(component.totalValue).toBe(3);
    });

    it('should correctly set listValues', async () => {
        component.listValues = [
            { value: 0, color: '#498B94', size: '0%', legend: 'A' },
            { value: 0, color: '#F8C622', size: '0%', legend: 'B' },
            { value: 0, color: '#747474', size: '0%', legend: 'C' },
            { value: 0, color: '#EC972D', size: '0%', legend: 'D' },
        ];
        expect(component.listValues).toEqual([
            { value: 0, color: '#498B94', size: '0%', legend: 'A' },
            { value: 0, color: '#F8C622', size: '0%', legend: 'B' },
            { value: 0, color: '#747474', size: '0%', legend: 'C' },
            { value: 0, color: '#EC972D', size: '0%', legend: 'D' },
        ]);
    });

    it('should correctly createChart', fakeAsync(() => {
        component.listValues = [
            { value: 0, color: '#498B94', size: '0%', legend: 'A' },
            { value: 0, color: '#F8C622', size: '0%', legend: 'B' },
            { value: 0, color: '#747474', size: '0%', legend: 'C' },
            { value: 0, color: '#EC972D', size: '0%', legend: 'D' },
        ];
        component.questionNumber = 0;
        component.ngOnInit();
        matchQuestionManagementServiceSpy.updateChart.emit({ player: 'Player1', answer: [0] });
        tick();
        expect(component.listValues.length).toBe(3);
    }));

    it('should correctly createChart', async () => {
        component.questionNumber = 0;
        component.gameValue = {
            $schema: 'quiz-schema.json',
            id: '1a2b3c1a2b3c1a2b3c1a2b3c',
            title: 'Questionnaire sur le JS',
            duration: 60,
            lastModification: '2018-11-13T20:20:39+00:00',
            visible: true,
            description: 'Un questionnaire sur le JS',
            questions: [
                {
                    type: 'QCM',
                    text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                    points: 40,
                    choices: [
                        {
                            text: 'var',
                            isCorrect: true,
                        },
                        {
                            text: 'self',
                            isCorrect: false,
                        },
                        {
                            text: 'this',
                            isCorrect: true,
                        },
                    ],
                },
            ],
        };

        await component.createChart();
        expect(component.listValues).toEqual([
            { value: 0, color: '#498B94', size: '0px', legend: 'var' },
            { value: 0, color: '#F8C622', size: '0px', legend: 'self' },
            { value: 0, color: '#747474', size: '0px', legend: 'this' },
        ]);
    });

    it('should call addBars when createChart is called and isQcm is false', async () => {
        component.questionNumber = 0;
        component.gameValue = {
            $schema: 'quiz-schema.json',
            id: '1a2b3c1a2b3c1a2b3c1a2b3c',
            title: 'Questionnaire sur le JS',
            duration: 60,
            lastModification: '2018-11-13T20:20:39+00:00',
            visible: true,
            description: 'Un questionnaire sur le JS',
            questions: [
                {
                    type: 'QCM',
                    text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                    points: 40,
                    choices: [
                        {
                            text: 'var',
                            isCorrect: true,
                        },
                        {
                            text: 'self',
                            isCorrect: false,
                        },
                        {
                            text: 'this',
                            isCorrect: true,
                        },
                    ],
                },
            ],
        };
        matchQuestionManagementServiceSpy.isQcm.and.returnValue(false);
        component['isQcm'] = false;
        await component.createChart();
        expect(histogramInfoServiceSpy.addBars).toHaveBeenCalled();
    });

    it('should call createChart when ngOInit is called', async () => {
        const answerIndex = [0];
        const updatedPlayersList = ['Player1', 'Player2', 'Player3'];
        const createChartSpy = spyOn(component, 'createChart');
        socketHelper.peerSideEmit('playerAnswerIndex', answerIndex);
        socketHelper.peerSideEmit('updatedPlayersList', updatedPlayersList);
        component.ngOnInit();
        expect(createChartSpy).toHaveBeenCalled();
        expect(component.gameValue).toEqual(mockGame);
    });

    it('should call unsubscribe for each subscription and endGame for each service when ngOnDestroy is called', () => {
        component.ngOnDestroy();
        expect(matchQuestionManagementServiceSpy.endGame).toHaveBeenCalled();
    });

    it('should correctly update the chart based on player answers', () => {
        const mockHistogramBars: HistogramBar[] = [
            { value: 0, color: '#498B94', size: '0%', legend: 'A' },
            { value: 0, color: '#F8C622', size: '0%', legend: 'B' },
            { value: 0, color: '#747474', size: '0%', legend: 'C' },
        ];
        component.listValues = mockHistogramBars;
        component['playersChoice'] = [
            { name: 'Player1', choices: [1, 2] },
            { name: 'Player2', choices: [0, 1] },
        ];
        component.updateChart({ player: 'Player1', answer: [0, 2] });
        const expectedHistogramBars: HistogramBar[] = [
            { value: 2, color: '#498B94', size: '160px', legend: 'A' },
            { value: 1, color: '#F8C622', size: '80px', legend: 'B' },
            { value: 1, color: '#747474', size: '80px', legend: 'C' },
        ];
        expect(component.listValues).toEqual(expectedHistogramBars);
        expect(component['playersChoice']).toEqual([
            { name: 'Player1', choices: [0, 2] },
            { name: 'Player2', choices: [0, 1] },
        ]);
    });
});
