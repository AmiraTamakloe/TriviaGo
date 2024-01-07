/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-empty-function */
import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Game } from '@app/interfaces/game';
import { PopupService } from '@app/services/popup/popup.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';
import { MatchQuestionManagementService } from './match-question-management.service';

class SocketClientServiceMock extends SocketClientService {
    override connect() {}
    // eslint-disable-next-line no-unused-vars
    override removeAllListeners(event?: string) {}
}

describe('MatchQuestionManagementService', () => {
    let popupServiceSpy: jasmine.SpyObj<PopupService>;
    let service: MatchQuestionManagementService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        popupServiceSpy = jasmine.createSpyObj('PopupService', ['openPopup', 'closePopup']);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: Router, useValue: routerSpy },
                { provide: PopupService, useValue: popupServiceSpy },
                MatSnackBar,
            ],
        });
        service = TestBed.inject(MatchQuestionManagementService);
        service['game'] = {
            questions: [],
        } as unknown as Game;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle the event of a question being done', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.questionOver();
        expect(spy).toHaveBeenCalled();
    });

    it('should init ', () => {
        service.init();
        socketHelper.peerSideEmit('matchOver');
        socketHelper.peerSideEmit('questionAnswered', true);
        socketHelper.peerSideEmit('questionOver');

        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should call audio pause on time is up', () => {
        service.init();
        const spy = spyOn(service['audioService'], 'pauseAudio');
        socketHelper.peerSideEmit('timeIsUp');
        expect(service.socketClientService.matchId).toEqual(service['matchId']);
        expect(spy).toHaveBeenCalled();
    });

    it('should init ', () => {
        service.init();
        socketHelper.peerSideEmit('playerAnswerIndex', [1]);

        expect(service.socketClientService.matchId).toEqual(service['matchId']);
    });

    it('should handle the event of timeAnswered', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.questionOver();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle the event of a match being done', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.matchOver();
        expect(spy).toHaveBeenCalled();
    });
    it('should handle the event of getting a time', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.timeAnswered();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle the event of playerAnswerIndex', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.playerAnswerIndex([1, 2, 3]);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle the event of playerAnswerIndex', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.playerAnswerIndex([1, 2, 3]);
        expect(spy).toHaveBeenCalled();
    });

    it('should handle the event of firstInteraction', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.firstInteraction();
        expect(spy).toHaveBeenCalled();
    });

    it('should handle the event of enterClick', () => {
        const spy = spyOn(service.socketClientService, 'send');
        service.enterClick();
        expect(spy).toHaveBeenCalled();
    });

    it('should emit answerResult with true when qcmResult is called with true', () => {
        const spy = spyOn(service.answerResult, 'emit');
        service.qcmResult(true);
        expect(spy).toHaveBeenCalledWith(true);
    });

    it('should emit answerResult with false when qcmResult is called with false', () => {
        const spy = spyOn(service.answerResult, 'emit');
        service.qcmResult(false);
        expect(spy).toHaveBeenCalledWith(false);
    });

    it('should call removeAllListeners method for each event when endGame is called', () => {
        service.init();
        const spy = spyOn(service.socketClientService, 'removeAllListeners');
        service.endGame();
        expect(spy).toHaveBeenCalled();
    });

    it('should return an observable of type boolean when a player is done', () => {
        const result = service.getIsEveryPlayerDone();
        expect(result).toEqual(jasmine.any(Observable));
        result.subscribe((value) => {
            expect(value).toEqual(jasmine.any(Boolean));
        });
    });

    it('should call intervalPopup on displayQuestionNextPopup', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(service, 'intervalPopup');
        service.displayQuestionNextPopup(true);
        expect(spy).toHaveBeenCalledWith(true, 1000);
    });

    it('should call setIsEveryPlayerDone, nextQuestion.emit, and startTimer once', (done) => {
        spyOn(service, 'incrementQuestion');
        service['intervalPopup'](true, 1);
        setTimeout(() => {
            expect(service.incrementQuestion).toHaveBeenCalled();
            done();
        }, 100);
    });

    it('should start audio on panic true', () => {
        service.init();
        const spy = spyOn(service['audioService'], 'loopAudio');
        socketHelper.peerSideEmit('panic', true);
        expect(spy).toHaveBeenCalled();
    });

    it('should stop audio on panic false', () => {
        service.init();
        const spy = spyOn(service['audioService'], 'pauseAudio');
        socketHelper.peerSideEmit('panic', false);
        expect(spy).toHaveBeenCalled();
    });
    it('should set isResult to true on last question', () => {
        service.init();
        service['isResultsValue'] = false;
        service['questionNumberValue'] = 0;
        service['game'] = {
            questions: [
                {
                    type: 'QCM',
                    text: 'string',
                    points: 1,
                    choices: [{ text: 'string', isCorrect: true }],
                },
            ],
        } as unknown as Game;
        socketHelper.peerSideEmit('questionOver', true);
        expect(service.isResults).toEqual(true);
    });
    it('should stop timer', () => {
        const spy = spyOn(service.timer, 'stop');
        service.stopTimer();
        expect(spy).toHaveBeenCalled();
    });
    it('should return true if question type is QCM', () => {
        service['questionTypeValue'] = 'QCM';
        expect(service.isQcm()).toEqual(true);
        service['questionTypeValue'] = 'QRL';
        expect(service.isQcm()).toEqual(false);
    });
    it('should reset on new match', () => {
        service['questionNumberValue'] = 1;
        service['game'] = {} as unknown as Game;
        service['questionTypeValue'] = 'QRL';
        service['isResultsValue'] = true;
        const newGame = {
            questions: [
                {
                    type: 'QCM',
                    text: 'string',
                    points: 1,
                    choices: [{ text: 'string', isCorrect: true }],
                },
            ],
        } as unknown as Game;
        service.newMatch(newGame);
        expect(service.questionNumber).toEqual(0);
        expect(service['game']).toEqual(newGame);
        expect(service.questionType).toEqual('QCM');
        expect(service.isResults).toEqual(false);
    });
    it('should increment question', () => {
        service['questionNumberValue'] = 0;
        service['game'] = {
            questions: [
                {
                    type: 'QCM',
                    text: 'string',
                    points: 1,
                    choices: [{ text: 'string', isCorrect: true }],
                },
                {
                    type: 'QRL',
                    text: 'string',
                    points: 1,
                    choices: [{ text: 'string', isCorrect: true }],
                },
            ],
        } as unknown as Game;
        service.incrementQuestion();
        expect(service.questionNumber).toEqual(1);
        expect(service.questionType).toEqual('QRL');
    });
    it('should set isResult to true on last question', () => {
        service['isResultsValue'] = false;
        service['questionNumberValue'] = 0;
        service['game'] = {
            questions: [
                {
                    type: 'QCM',
                    text: 'string',
                    points: 1,
                    choices: [{ text: 'string', isCorrect: true }],
                },
            ],
        } as unknown as Game;
        service.setNextButtonVisible();
        expect(service.isResults).toEqual(true);
    });
});
